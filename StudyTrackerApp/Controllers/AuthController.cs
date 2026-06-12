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
        // Busca o estudante pelo e-mail
        var estudante = await _context.Estudantes.FirstOrDefaultAsync(e => e.Email == dto.Email);

        // Valida se o usuário existe e se a senha bate (BCrypt cuida da comparação do Hash)
        if (estudante == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, estudante.SenhaHash))
            return Unauthorized(new { message = "E-mail ou senha incorretos." });

        // Gera o token JWT para autenticar as próximas requisições
        var tokenHandler = new JwtSecurityTokenHandler();

        // Dica: em produção, essa chave deveria vir das configurações do sistema (appsettings.json)
        var key = Encoding.UTF8.GetBytes("uma_chave_muito_longa_e_secreta_para_seguranca_12345");

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            // O ID do estudante vai dentro do token como uma "claim"
            Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, estudante.Id.ToString()) }),
            Expires = DateTime.UtcNow.AddDays(7), // Token expira em 7 dias
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new
        {
            token = tokenHandler.WriteToken(token),
            message = "Login realizado com sucesso."
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Estudantes.AnyAsync(e => e.Email == dto.Email))
            return BadRequest(new { message = "Email já cadastrado." });

        var estudante = new Estudante
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
        };

        _context.Estudantes.Add(estudante);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cadastro realizado com sucesso." });
    }
}