using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        // O construtor recebe a conexão do banco de dados (AppDbContext)
        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // 1. ROTA DE CADASTRO (REGISTRO)
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] LoginDto dto)
        {
            // Busca segura contra SQL Injection: verifica se o e-mail já existe
            var usuarioExiste = await _context.Estudantes.AnyAsync(e => e.Email == dto.Email);
            if (usuarioExiste)
            {
                return BadRequest("Este e-mail já está cadastrado.");
            }

            // CRIPTOGRAFIA: Transforma a senha "123" em uma hash matemática irreconhecível
            string senhaCriptografada = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

            var novoEstudante = new Estudante
            {
                Nome = dto.Email.Split('@')[0], // Gera um nome temporário antes do '@'
                Email = dto.Email,
                SenhaHash = senhaCriptografada
            };

            _context.Estudantes.Add(novoEstudante);
            await _context.SaveChangesAsync();

            return Ok("Usuário cadastrado com sucesso!");
        }

        // 2. ROTA DE LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // Busca o estudante no SQLite pelo e-mail
            var estudante = await _context.Estudantes.FirstOrDefaultAsync(e => e.Email == dto.Email);

            // Se o e-mail não existir no banco, barra aqui
            if (estudante == null)
            {
                return Unauthorized("E-mail ou senha incorretos.");
            }

            // O BCrypt descriptografa temporariamente e compara as duas senhas
            bool senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, estudante.SenhaHash);

            if (!senhaValida)
            {
                return Unauthorized("E-mail ou senha incorretos.");
            }

            // Se der certo, retorna os dados para o React da Gabriella
            return Ok(new
            {
                mensagem = "Login efetuado com sucesso!",
                estudanteId = estudante.Id,
                nome = estudante.Nome
            });
        }
    }
}