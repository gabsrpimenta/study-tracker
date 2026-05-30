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

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/registrar
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] LoginDto dto)
        {
            // Evita o cadastro de e-mails duplicados
            var usuarioExiste = await _context.Estudantes.AnyAsync(e => e.Email == dto.Email);
            if (usuarioExiste)
            {
                return BadRequest("Este e-mail já está cadastrado.");
            }

            // Cria a hash segura da senha usando BCrypt
            string senhaCriptografada = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

            var novoEstudante = new Estudante
            {
                Nome = dto.Email.Split('@')[0], // Usa a primeira parte do e-mail como nome padrão
                Email = dto.Email,
                SenhaHash = senhaCriptografada
            };

            _context.Estudantes.Add(novoEstudante);
            await _context.SaveChangesAsync();

            return Ok("Usuário cadastrado com sucesso!");
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // Busca o usuário pelo e-mail informado
            var estudante = await _context.Estudantes.FirstOrDefaultAsync(e => e.Email == dto.Email);
            if (estudante == null)
            {
                return Unauthorized("E-mail ou senha incorretos.");
            }

            // Verifica se a senha informada bate com a hash salva no banco
            bool senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, estudante.SenhaHash);
            if (!senhaValida)
            {
                return Unauthorized("E-mail ou senha incorretos.");
            }

            // Retorna os dados essenciais para o gerenciamento da sessão no frontend
            return Ok(new
            {
                mensagem = "Login efetuado com sucesso!",
                estudanteId = estudante.Id,
                nome = estudante.Nome
            });
        }
    }
}