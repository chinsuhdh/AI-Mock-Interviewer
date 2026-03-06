using System.Text;
using System.Text.Json;

namespace AIMockInterview.API.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"];
        }

        // --- HÀM 1: CHAT TƯƠNG TÁC (HYBRID LANGUAGE) ---
        public async Task<string> GenerateInterviewResponse(string userMessage, string jobDescription, List<string> history, string language = "vi")
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            string systemInstruction = $@"
                You are a professional Interviewer for: '{jobDescription}'.
                
                *** MISSION ***:
                1. Analyze the candidate's input (Vietnamese or English).
                2. Provide constructive feedback in VIETNAMESE.
                3. Ask the next question in VIETNAMESE (for display).
                4. Translate that EXACT next question into ENGLISH (for voice generation).

                *** OUTPUT FORMAT (JSON ONLY) ***:
                {{
                    ""feedback"": ""(Tiếng Việt) Nhận xét ngắn gọn về câu trả lời..."",
                    ""nextQuestion"": ""(Tiếng Việt) Câu hỏi tiếp theo..."",
                    ""nextQuestionEn"": ""(English) The exact English translation of the nextQuestion field.""
                }}
            ";

            string context = string.Join("\n", history);
            string fullPrompt = $"{systemInstruction}\n\n[Chat History]:\n{context}\n\n[Candidate Answer]: {userMessage}\n\n[AI Response (JSON)]:";

            return await CallGeminiApi(url, fullPrompt);
        }

        // --- HÀM 2: PHÂN TÍCH JD (Cập nhật số lượng câu hỏi) ---
        public async Task<string> AnalyzeJdAndCreateQuestions(string jobDescription, string language = "vi")
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            // CẬP NHẬT PROMPT QUAN TRỌNG
            string prompt = $@"
                Act as a Senior Recruiter. Analyze this JD: '{jobDescription}'.
                
                Task: Create a COMPREHENSIVE list of interview questions.
                
                *** RULES ***:
                1. Quantity: Generate EXACTLY 8 to 10 questions. (Do not generate less than 8).
                2. Content: 
                   - 2 Introduction/Ice-breaking questions.
                   - 3 Behavioral/Situational questions.
                   - 3-5 Technical/Skill-based questions specific to the JD.
                3. Format: JSON Array of Objects with 'vi' and 'en' fields.

                *** OUTPUT FORMAT (STRICT JSON ARRAY) ***:
                [
                    {{ ""vi"": ""Câu hỏi 1..."", ""en"": ""Question 1..."" }},
                    {{ ""vi"": ""Câu hỏi 2..."", ""en"": ""Question 2..."" }},
                    ... (continue until 8-10 questions)
                ]
            ";

            return await CallGeminiApi(url, prompt);
        }

        // Helper function
        private async Task<string> CallGeminiApi(string url, string prompt)
        {
            var requestBody = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { responseMimeType = "application/json" }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API Error: {errorContent}");
            }

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);
            var text = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return (text ?? "").Replace("```json", "").Replace("```", "").Trim();
        }
        public async Task<string> GetHintForQuestion(string currentQuestion, string jobDescription)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            string prompt = $@"
        You are an Interview Mentor. A candidate is stuck on this question: '{currentQuestion}' 
        for the position described in this JD: '{jobDescription}'.

        *** MISSION ***:
        Provide a 'Hint' to help them answer. Do NOT answer for them.
        
        *** OUTPUT FORMAT (JSON ONLY) ***:
        {{
            ""hintVi"": ""(Tiếng Việt) 3 ý chính nên nói (bullet points) và 1 câu mở đầu mẫu..."",
            ""hintEn"": ""(English) 3 key points to cover and a sample opening sentence...""
        }}
    ";

            return await CallGeminiApi(url, prompt);
        }
    }

}