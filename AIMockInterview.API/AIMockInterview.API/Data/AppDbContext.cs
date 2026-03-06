using AIMockInterview.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AIMockInterview.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // --- ĐÂY LÀ DÒNG BẠN ĐANG THIẾU ---
        public DbSet<User> Users { get; set; }
        // ----------------------------------

        public DbSet<InterviewSession> InterviewSessions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
    }
}