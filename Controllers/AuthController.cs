using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudyTrackerApp.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StudyTrackerApp.Controllers;

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
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _context.Estudantes.AnyAsync(x => x.Email == dto.Email))
            return BadRequest(new { message = "Email já existe" });

        var user = new Estudante
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
        };

        _context.Estudantes.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Conta criada" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Estudantes.FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, user.SenhaHash))
            return Unauthorized(new { message = "Credenciais inválidas" });

        var key = Encoding.UTF8.GetBytes("uma_chave_muito_longa_e_secreta_para_seguranca_12345");

        var tokenHandler = new JwtSecurityTokenHandler();

        var token = tokenHandler.CreateToken(new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Nome)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        });

        return Ok(new
        {
            token = tokenHandler.WriteToken(token),
            nome = user.Nome,
            id = user.Id
        });
    }
}