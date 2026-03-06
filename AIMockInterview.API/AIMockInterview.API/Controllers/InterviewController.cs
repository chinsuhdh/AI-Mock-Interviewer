using AIMockInterview.API.Data;
using AIMockInterview.API.Models;
using AIMockInterview.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using UglyToad.PdfPig;

namespace AIMockInterview.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterviewController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GeminiService _geminiService;

        public InterviewController(AppDbContext context, GeminiService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
        }

        // --- 1. UPLOAD FILE ---
        [HttpPost("upload-jd")]
        public async Task<IActionResult> UploadJd(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File không hợp lệ");

            var resultText = "";
            try
            {
                // Đọc PDF
                if (file.FileName.EndsWith(".pdf"))
                {
                    using (var stream = file.OpenReadStream())
                    using (var document = PdfDocument.Open(stream))
                    {
                        foreach (var page in document.GetPages())
                        {
                            resultText += page.Text + " ";
                        }
                    }
                }
                // Đọc Docx/Text
                else
                {
                    using (var reader = new StreamReader(file.OpenReadStream()))
                    {
                        resultText = await reader.ReadToEndAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi đọc file: {ex.Message}");
            }

            return Ok(new { text = resultText });
        }

        // --- 2. START SESSION ---
        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] StartSessionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.JobDescription)) return BadRequest("JD trống");

            // Gọi AI để phân tích JD
            string questionsJson = await _geminiService.AnalyzeJdAndCreateQuestions(request.JobDescription, request.Language);

            List<QuestionItem> questions = new List<QuestionItem>();

            // FIX: Khai báo firstQ ở đây để dùng được bên dưới
            QuestionItem? firstQ = null;

            try
            {
                string cleanJson = questionsJson.Replace("```json", "").Replace("```", "").Trim();
                questions = JsonSerializer.Deserialize<List<QuestionItem>>(cleanJson) ?? new List<QuestionItem>();
            }
            catch
            {
                // Fallback nếu lỗi
                questions = new List<QuestionItem> {
                    new QuestionItem { vi = "Hãy giới thiệu về bản thân bạn.", en = "Please introduce yourself." }
                };
            }

            // Gán giá trị cho firstQ
            firstQ = questions.FirstOrDefault();

            // Lưu session
            var session = new InterviewSession
            {
                JobDescription = request.JobDescription,
                CreatedAt = DateTime.Now
            };
            _context.InterviewSessions.Add(session);
            await _context.SaveChangesAsync();

            // Lưu câu hỏi đầu tiên (Tiếng Việt) vào DB
            _context.ChatMessages.Add(new ChatMessage
            {
                InterviewSessionId = session.Id,
                Sender = "AI",
                Content = firstQ?.vi ?? "", // Lưu tiếng Việt vào DB
                Timestamp = DateTime.Now
            });
            await _context.SaveChangesAsync();

            // TRẢ VỀ CẢ 2 NGÔN NGỮ
            return Ok(new
            {
                sessionId = session.Id,
                message = firstQ?.vi ?? "",    // Để hiển thị
                messageEn = firstQ?.en ?? "",  // Để đọc (Voice)
                script = questions
            });
        }

        // --- 3. CHAT INTERACTION (Hybrid Mode: Việt -> Anh) ---
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            var session = await _context.InterviewSessions.FindAsync(request.SessionId);
            if (session == null) return NotFound("Session not found");

            // A. Lưu tin nhắn của User
            var userMsg = new ChatMessage
            {
                InterviewSessionId = request.SessionId,
                Sender = "User",
                Content = request.UserMessage,
                Timestamp = DateTime.Now
            };
            _context.ChatMessages.Add(userMsg);
            await _context.SaveChangesAsync();

            // B. Lấy lịch sử chat
            var rawHistory = await _context.ChatMessages
                .Where(m => m.InterviewSessionId == request.SessionId)
                .OrderByDescending(m => m.Timestamp)
                .Take(10)
                .ToListAsync();

            var historyList = rawHistory
                .OrderBy(m => m.Timestamp)
                .Select(m => $"{m.Sender}: {m.Content}")
                .ToList();

            // C. Gọi AI sinh câu trả lời
            string aiJson = await _geminiService.GenerateInterviewResponse(
                request.UserMessage,
                session.JobDescription,
                historyList,
                request.Language
            );

            string feedback = "";
            string nextQuestion = "";     // Tiếng Việt (để hiển thị)
            string nextQuestionEn = "";   // Tiếng Anh (để đọc Voice)

            try
            {
                string cleanJson = aiJson.Replace("```json", "").Replace("```", "").Trim();
                var aiData = JsonSerializer.Deserialize<GeminiResponse>(cleanJson);

                feedback = aiData?.feedback ?? "";
                nextQuestion = aiData?.nextQuestion ?? aiJson;
                nextQuestionEn = aiData?.nextQuestionEn ?? "";
            }
            catch
            {
                nextQuestion = aiJson;
            }

            // D. Lưu câu trả lời của AI vào DB
            var aiMsg = new ChatMessage
            {
                InterviewSessionId = request.SessionId,
                Sender = "AI",
                Content = nextQuestion, // Lưu bản hiển thị (Tiếng Việt)
                Feedback = feedback,
                Timestamp = DateTime.Now
            };
            _context.ChatMessages.Add(aiMsg);
            await _context.SaveChangesAsync();

            // E. Trả về Frontend
            return Ok(new
            {
                response = nextQuestion,
                feedback = feedback,
                nextQuestionEn = nextQuestionEn
            });
        }

        [HttpPost("get-hint")]
        public async Task<IActionResult> GetHint([FromBody] HintRequest request)
        {
            var session = await _context.InterviewSessions.FindAsync(request.SessionId);
            if (session == null) return NotFound();

            string hintJson = await _geminiService.GetHintForQuestion(request.CurrentQuestion, session.JobDescription);
            return Ok(hintJson); // Trả về JSON chứa hintVi và hintEn
        }
    }

    // --- DTO Classes ---
    public class GeminiResponse
    {
        public string feedback { get; set; }
        public string nextQuestion { get; set; }
        public string nextQuestionEn { get; set; }
    }

    public class StartSessionRequest
    {
        public string JobDescription { get; set; }
        public string Language { get; set; } = "vi";
    }

    public class ChatRequest
    {
        public int SessionId { get; set; }
        public string UserMessage { get; set; }
        public string Language { get; set; } = "vi";
    }

    // Class này cần thiết để hứng JSON từ AnalyzeJdAndCreateQuestions
    public class QuestionItem
    {
        public string vi { get; set; }
        public string en { get; set; }
    }

    public class HintRequest
    {
        public int SessionId { get; set; }
        public string CurrentQuestion { get; set; }
    }
}