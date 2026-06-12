using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudyTrackerApp.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context) => _context = context;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var existe = await _context.Estudantes.AnyAsync(e => e.Email == dto.Email);
        if (existe)
            return BadRequest(new { message = "Este e-mail já está em uso." });

        var estudante = new Estudante
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
        };

        _context.Estudantes.Add(estudante);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Conta criada com sucesso." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var estudante = await _context.Estudantes.FirstOrDefaultAsync(e => e.Email == dto.Email);

        if (estudante == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, estudante.SenhaHash))
            return Unauthorized(new { message = "E-mail ou senha incorretos." });

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes("uma_chave_muito_longa_e_secreta_para_seguranca_12345");

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", estudante.Id.ToString()),
                new Claim("nome", estudante.Nome)  // ✅ nome incluído no token
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new
        {
            token = tokenHandler.WriteToken(token),
            message = "Login realizado com sucesso."
        });
    }
}