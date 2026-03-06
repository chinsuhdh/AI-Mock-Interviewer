namespace AIMockInterview.API.DTOs
{
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
    }

    public class ChatRequest
    {
        public int SessionId { get; set; }
        public string UserMessage { get; set; }
    }
}