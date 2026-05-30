using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TarefasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TarefasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Tarefas (FILTROS INTELIGENTES)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefa(
            [FromQuery] int? estudanteId = null,
            [FromQuery] bool? concluida = null)
        {
            var query = _context.Tarefas.AsQueryable();

            // 1. Filtro por Estudante
            if (estudanteId.HasValue)
            {
                query = query.Where(t => t.EstudanteId == estudanteId.Value);
            }

            // 2. Filtro por Status (Concluída ou Pendente)
            if (concluida.HasValue)
            {
                query = query.Where(t => t.Concluida == concluida.Value);
            }

            return await query.ToListAsync();
        }

        // GET: api/Tarefas/calendario (US06 - DASHBOARD COM CALENDÁRIO)
        // Exemplo de uso: api/Tarefas/calendario?ano=2026&mes=5&estudanteId=1
        [HttpGet("calendario")]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefasCalendario(
            [FromQuery] int ano,
            [FromQuery] int mes,
            [FromQuery] int? estudanteId = null)
        {
            // Define o primeiro dia do mês e calcula o último dia dele de forma automática
            var dataInicio = new DateTime(ano, mes, 1);
            var dataFim = dataInicio.AddMonths(1).AddDays(-1);

            // Busca as tarefas que estão dentro do período desse mês específico
            var query = _context.Tarefas.Where(t => t.Data >= dataInicio && t.Data <= dataFim);

            // Filtra pelo estudante logado para o calendário ser individual
            if (estudanteId.HasValue)
            {
                query = query.Where(t => t.EstudanteId == estudanteId.Value);
            }

            // Retorna as tarefas ordenadas por dia para o calendário renderizar na ordem certa
            return await query.OrderBy(t => t.Data).ToListAsync();
        }

        // GET: api/Tarefas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Tarefa>> GetTarefa(int id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);

            if (tarefa == null)
            {
                return NotFound();
            }

            return tarefa;
        }

        // PUT: api/Tarefas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTarefa(int? id, Tarefa tarefa)
        {
            if (id != tarefa.Id)
            {
                return BadRequest();
            }

            _context.Entry(tarefa).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TarefaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Tarefas
        [HttpPost]
        public async Task<ActionResult<Tarefa>> PostTarefa(Tarefa tarefa)
        {
            _context.Tarefas.Add(tarefa);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTarefa", new { id = tarefa.Id }, tarefa);
        }

        // DELETE: api/Tarefas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTarefa(int? id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);
            if (tarefa == null)
            {
                return NotFound();
            }

            _context.Tarefas.Remove(tarefa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TarefaExists(int? id)
        {
            return _context.Tarefas.Any(e => e.Id == id);
        }
    }
}