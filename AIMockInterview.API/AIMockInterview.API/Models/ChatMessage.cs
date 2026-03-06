using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AIMockInterview.API.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }
        public int InterviewSessionId { get; set; }

        public string Sender { get; set; } = "User"; // "User" hoặc "AI"
        public string Content { get; set; } = string.Empty; // Nội dung nói

        // USP: Lưu phản hồi/đánh giá của AI cho riêng câu này
        public string? Feedback { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.Now;

        [JsonIgnore]
        public InterviewSession? InterviewSession { get; set; }
    }
}