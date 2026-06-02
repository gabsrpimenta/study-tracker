using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TarefasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TarefasController(AppDbContext context) => _context = context;

        // Método auxiliar para obter o ID do token do usuário logado
        private int GetEstudanteId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        // GET: api/Tarefas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefas([FromQuery] bool? concluida)
        {
            var estudanteId = GetEstudanteId();
            var query = _context.Tarefas.AsNoTracking().Where(t => t.EstudanteId == estudanteId);

            if (concluida.HasValue) query = query.Where(t => t.Concluida == concluida.Value);

            return await query.ToListAsync();
        }

        // GET: api/Tarefas/alertas
        [HttpGet("alertas")]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetAlertas()
        {
            var estudanteId = GetEstudanteId();
            var dataLimite = DateTime.Today.AddDays(3);

            return await _context.Tarefas.AsNoTracking()
                .Where(t => t.EstudanteId == estudanteId && t.Data <= dataLimite && !t.Concluida)
                .OrderBy(t => t.Data)
                .ToListAsync();
        }

        // GET: api/Tarefas/calendario
        [HttpGet("calendario")]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefasCalendario([FromQuery] int ano, [FromQuery] int mes)
        {
            var estudanteId = GetEstudanteId();
            var dataInicio = new DateTime(ano, mes, 1);
            var dataFim = dataInicio.AddMonths(1).AddDays(-1);

            return await _context.Tarefas.AsNoTracking()
                .Where(t => t.EstudanteId == estudanteId && t.Data >= dataInicio && t.Data <= dataFim)
                .OrderBy(t => t.Data)
                .ToListAsync();
        }

        // GET: api/Tarefas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Tarefa>> GetTarefa(int id)
        {
            var estudanteId = GetEstudanteId();
            var tarefa = await _context.Tarefas.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id && t.EstudanteId == estudanteId);

            if (tarefa == null) return NotFound("Tarefa não encontrada ou não pertence a este usuário.");

            return tarefa;
        }

        // POST: api/Tarefas
        [HttpPost]
        public async Task<ActionResult<Tarefa>> PostTarefa(Tarefa tarefa)
        {
            tarefa.EstudanteId = GetEstudanteId();
            _context.Tarefas.Add(tarefa);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTarefa", new { id = tarefa.Id }, tarefa);
        }

        // PUT: api/Tarefas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTarefa(int id, Tarefa tarefa)
        {
            var estudanteId = GetEstudanteId();
            if (id != tarefa.Id || tarefa.EstudanteId != estudanteId)
                return BadRequest("ID inválido ou sem permissão.");

            _context.Entry(tarefa).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Tarefas.Any(t => t.Id == id)) return NotFound("Tarefa não encontrada.");
                else throw;
            }

            return NoContent();
        }

        // PATCH: api/Tarefas/5/alternar-conclusao
        [HttpPatch("{id}/alternar-conclusao")]
        public async Task<IActionResult> AlternarConclusao(int id)
        {
            var estudanteId = GetEstudanteId();
            var tarefa = await _context.Tarefas.FirstOrDefaultAsync(t => t.Id == id && t.EstudanteId == estudanteId);

            if (tarefa == null) return NotFound("Tarefa não encontrada.");

            tarefa.Concluida = !tarefa.Concluida;
            await _context.SaveChangesAsync();

            return Ok(new { id = tarefa.Id, concluida = tarefa.Concluida });
        }

        // DELETE: api/Tarefas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTarefa(int id)
        {
            var estudanteId = GetEstudanteId();
            var tarefa = await _context.Tarefas.FirstOrDefaultAsync(t => t.Id == id && t.EstudanteId == estudanteId);

            if (tarefa == null) return NotFound("Tarefa não encontrada.");

            _context.Tarefas.Remove(tarefa);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}