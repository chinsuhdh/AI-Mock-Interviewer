using AIMockInterview.API.Data;
using AIMockInterview.API.DTOs;
using AIMockInterview.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AIMockInterview.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Tên đăng nhập đã tồn tại.");

            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Email = request.Email
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("Đăng ký thành công!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest("Sai tài khoản hoặc mật khẩu.");

            var token = CreateToken(user);
            return Ok(new { token, userId = user.Id, fullName = user.FullName });
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, UpdateProfileRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            user.FullName = request.FullName;
            user.Email = request.Email;
            await _context.SaveChangesAsync();
            return Ok("Cập nhật thành công!");
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim> {
        new Claim(ClaimTypes.Name, user.Username),
        new Claim("UserId", user.Id.ToString())
    };

            // ✅ Dùng key đủ dài ≥ 64 ký tự (SHA512 yêu cầu)
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                "MyUltraSecureKey_For_AI_Mock_Interview_App_2026_!@#_SuperLongKey_ABCDEFGH1234567890"
            ));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}