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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // Busca o estudante pelo e-mail informado
        var estudante = await _context.Estudantes.FirstOrDefaultAsync(e => e.Email == dto.Email);

        // Verificação de segurança: O uso de BCrypt.Verify protege contra ataques de força bruta,
        // comparando a senha digitada com o Hash armazenado (nunca guardamos senhas em texto puro).
        if (estudante == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, estudante.SenhaHash))
            return Unauthorized(new { message = "E-mail ou senha incorretos." });

        // Geração do Token JWT (JSON Web Token)
        var tokenHandler = new JwtSecurityTokenHandler();

        // Em produção, esta chave deve vir do appsettings.json ou de um gerenciador de segredos (Key Vault)
        var key = Encoding.UTF8.GetBytes("uma_chave_muito_longa_e_secreta_para_seguranca_12345");

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            // Claims são as "afirmações" ou dados incluídos dentro do token
            Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, estudante.Id.ToString()) }),
            Expires = DateTime.UtcNow.AddDays(7), // Token com validade de uma semana
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new
        {
            token = tokenHandler.WriteToken(token),
            message = "Login realizado com sucesso."
        });
    }
}