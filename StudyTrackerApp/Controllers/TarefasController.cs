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

        // GET: api/Tarefas (ATUALIZADO COM OS FILTROS REAIS DO TEU MODELO)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefa(
            [FromQuery] int? estudanteId = null,
            [FromQuery] bool? concluida = null)
        {
            // Começamos com a query base de tarefas
            var query = _context.Tarefas.AsQueryable();

            // 1. FILTRO POR ESTUDANTE: Se o React enviar o ID do estudante logado
            if (estudanteId.HasValue)
            {
                query = query.Where(t => t.EstudanteId == estudanteId.Value);
            }

            // 2. FILTRO POR STATUS (CONCLUÍDA): Se enviar true (concluídas) ou false (pendentes)
            if (concluida.HasValue)
            {
                query = query.Where(t => t.Concluida == concluida.Value);
            }

            // Executa tudo no banco SQLite de forma ultra rápida
            return await query.ToListAsync();
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