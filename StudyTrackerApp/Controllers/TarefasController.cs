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

        // GET: api/Tarefas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefa(
            [FromQuery] int? estudanteId = null,
            [FromQuery] bool? concluida = null)
        {
            var query = _context.Tarefas.AsQueryable();

            // Aplica os filtros dinamicamente se forem informados
            if (estudanteId.HasValue)
            {
                query = query.Where(t => t.EstudanteId == estudanteId.Value);
            }

            if (concluida.HasValue)
            {
                query = query.Where(t => t.Concluida == concluida.Value);
            }

            return await query.ToListAsync();
        }

        // GET: api/Tarefas/calendario
        [HttpGet("calendario")]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefasCalendario(
            [FromQuery] int ano,
            [FromQuery] int mes,
            [FromQuery] int? estudanteId = null)
        {
            // Define o período inicial e final do mês selecionado
            var dataInicio = new DateTime(ano, mes, 1);
            var dataFim = dataInicio.AddMonths(1).AddDays(-1);

            var query = _context.Tarefas.Where(t => t.Data >= dataInicio && t.Data <= dataFim);

            if (estudanteId.HasValue)
            {
                query = query.Where(t => t.EstudanteId == estudanteId.Value);
            }

            return await query.OrderBy(t => t.Data).ToListAsync();
        }

        // GET: api/Tarefas/estatisticas
        [HttpGet("estatisticas")]
        public async Task<IActionResult> GetEstatisticas([FromQuery] int estudanteId)
        {
            var tarefas = await _context.Tarefas
                .Where(t => t.EstudanteId == estudanteId)
                .ToListAsync();

            int total = tarefas.Count;
            int concluidas = tarefas.Count(t => t.Concluida);

            // Calcula a porcentagem evitando divisão por zero se não houver tarefas
            double progresso = total > 0 ? Math.Round(((double)concluidas / total) * 100, 1) : 0;

            return Ok(new { total, concluidas, progresso });
        }

        // PATCH: api/Tarefas/5/alternar-conclusao
        [HttpPatch("{id}/alternar-conclusao")]
        public async Task<IActionResult> AlternarConclusao(int id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);
            if (tarefa == null)
            {
                return NotFound("Tarefa não encontrada.");
            }

            // Inverte o estado de conclusão da tarefa
            tarefa.Concluida = !tarefa.Concluida;

            _context.Entry(tarefa).Property(x => x.Concluida).IsModified = true;
            await _context.SaveChangesAsync();

            return Ok(new { id = tarefa.Id, concluida = tarefa.Concluida });
        }

        // GET: api/Tarefas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Tarefa>> GetTarefa(int id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);

            if (tarefa == null)
            {
                return NotFound("Tarefa não encontrada.");
            }

            return tarefa;
        }

        // PUT: api/Tarefas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTarefa(int id, Tarefa tarefa)
        {
            if (id != tarefa.Id)
            {
                return BadRequest("O ID informado não coincide com o objeto.");
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
                    return NotFound("Tarefa não encontrada para atualização.");
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
        public async Task<IActionResult> DeleteTarefa(int id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);
            if (tarefa == null)
            {
                return NotFound("Tarefa não encontrada para exclusão.");
            }

            _context.Tarefas.Remove(tarefa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TarefaExists(int id)
        {
            return _context.Tarefas.Any(e => e.Id == id);
        }
    }
}