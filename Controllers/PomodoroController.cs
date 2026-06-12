using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Authorize] // Garante que só usuários autenticados acessem o histórico de pomodoros
    [Route("api/[controller]")]
    [ApiController]
    public class PomodoroController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PomodoroController(AppDbContext context) => _context = context;

        // Pega o ID direto do token: evita que o usuário tente "adivinhar" o ID de outro
        private int GetEstudanteId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        [HttpGet("resumo")]
        public async Task<ActionResult> GetResumoPomodoro()
        {
            var estudanteId = GetEstudanteId();

            // O SumAsync deixa o banco de dados fazer a conta, é bem mais rápido que trazer tudo pra memória
            var totalMinutos = await _context.Pomodoros
                .Where(p => p.EstudanteId == estudanteId)
                .SumAsync(p => p.DuracaoMinutos);

            return Ok(new { totalMinutosEstudados = totalMinutos });
        }

        [HttpPost]
        public async Task<ActionResult<Pomodoro>> PostPomodoro(Pomodoro pomodoro)
        {
            // O servidor define quem é o dono e quando foi concluído, pra garantir a integridade
            pomodoro.EstudanteId = GetEstudanteId();
            pomodoro.DataConclusao = DateTime.Now;

            _context.Pomodoros.Add(pomodoro);
            await _context.SaveChangesAsync();

            // Retorna o resumo atualizado após o novo registro
            return CreatedAtAction(nameof(GetResumoPomodoro), new { }, pomodoro);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pomodoro>>> GetPomodoros()
        {
            var estudanteId = GetEstudanteId();

            // Traz só o que é do estudante logado e ordena pelos mais recentes primeiro
            return await _context.Pomodoros
                .AsNoTracking()
                .Where(p => p.EstudanteId == estudanteId)
                .OrderByDescending(p => p.DataConclusao)
                .ToListAsync();
        }
    }
}