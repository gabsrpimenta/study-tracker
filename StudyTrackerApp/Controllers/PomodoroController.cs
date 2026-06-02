using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PomodoroController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PomodoroController(AppDbContext context) => _context = context;

        // Método auxiliar para obter o ID do token
        private int GetEstudanteId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        // GET: api/Pomodoro/resumo
        // Agora busca direto do token, sem precisar de ID na URL
        [HttpGet("resumo")]
        public async Task<ActionResult> GetResumoPomodoro()
        {
            var estudanteId = GetEstudanteId();
            var totalMinutos = await _context.Pomodoros
                .Where(p => p.EstudanteId == estudanteId)
                .SumAsync(p => p.DuracaoMinutos);

            return Ok(new { totalMinutosEstudados = totalMinutos });
        }

        // POST: api/Pomodoro
        [HttpPost]
        public async Task<ActionResult<Pomodoro>> PostPomodoro(Pomodoro pomodoro)
        {
            pomodoro.EstudanteId = GetEstudanteId(); // Força o vínculo com o usuário logado
            pomodoro.DataConclusao = DateTime.Now;

            _context.Pomodoros.Add(pomodoro);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetResumoPomodoro), new { }, pomodoro);
        }

        // GET: api/Pomodoro
        // Lista apenas os pomodoros do estudante logado
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pomodoro>>> GetPomodoros()
        {
            var estudanteId = GetEstudanteId();
            return await _context.Pomodoros
                .Where(p => p.EstudanteId == estudanteId)
                .ToListAsync();
        }
    }
}