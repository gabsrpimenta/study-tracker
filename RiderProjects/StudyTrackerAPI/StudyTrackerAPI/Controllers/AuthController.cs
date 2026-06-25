using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using StudyTrackerAPI.Data;
using StudyTrackerAPI.Models;

namespace StudyTrackerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(User dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Este email já está em uso." });

        _db.Users.Add(dto);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Registado com sucesso!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(User dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Senha == dto.Senha);
        if (user == null) return BadRequest(new { message = "Email ou senha incorretos." });

        var tokenHandler = new JwtSecurityTokenHandler();
        // A mesma chave secreta usada para assinar o token
        var key = Encoding.ASCII.GetBytes("SuperChaveSecretaDoStudyTrackerParaGarantirSeguranca123!!");
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(new[] {
                new Claim("nameid", user.Id.ToString()),
                new Claim("nome", user.Nome ?? "Estudante")
            }),
            Expires = DateTime.UtcNow.AddDays(7), // O utilizador fica logado 7 dias
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return Ok(new { token = tokenHandler.WriteToken(token) });
    }
}