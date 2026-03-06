using System.ComponentModel.DataAnnotations;

namespace AIMockInterview.API.Models
{
    public class InterviewSession
    {
        [Key]
        public int Id { get; set; }
        public string JobDescription { get; set; } = string.Empty; // JD dùng để AI "học"
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Quan hệ: 1 buổi phỏng vấn có nhiều câu thoại
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}