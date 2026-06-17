using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Route("api/[controller]")] // Rota automática: api/Disciplinas
    [ApiController]
    public class DisciplinasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DisciplinasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Disciplinas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetDisciplinas()
        {
            var disciplinas = await _context.Disciplinas
                .Include(d => d.ListaTarefas)
                .Select(d => new
                {
                    d.Id,
                    d.Nome,
                    d.Professor,
                    d.Ativa,
                    d.EstudanteId,
                    // Conta as tarefas associadas que NÃO estão concluídas
                    Tarefas = d.ListaTarefas.Count(t => !t.Concluida),
                    // Calcula a percentagem com base nas concluídas
                    Progresso = d.ListaTarefas.Any()
                        ? (d.ListaTarefas.Count(t => t.Concluida) * 100) / d.ListaTarefas.Count
                        : 0
                })
                .ToListAsync();

            return Ok(disciplinas);
        }

        // GET: api/Disciplinas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetDisciplina(int id)
        {
            var disciplina = await _context.Disciplinas
                .Include(d => d.ListaTarefas)
                .Where(d => d.Id == id)
                .Select(d => new
                {
                    d.Id,
                    d.Nome,
                    d.Professor,
                    d.Ativa,
                    d.EstudanteId,
                    Tarefas = d.ListaTarefas.Count(t => !t.Concluida),
                    Progresso = d.ListaTarefas.Any()
                        ? (d.ListaTarefas.Count(t => t.Concluida) * 100) / d.ListaTarefas.Count
                        : 0
                })
                .FirstOrDefaultAsync();

            if (disciplina == null) return NotFound(new { mensagem = "Disciplina não encontrada." });

            return Ok(disciplina);
        }

        // POST: api/Disciplinas
        [HttpPost]
        public async Task<ActionResult<Disciplina>> PostDisciplina(Disciplina disciplina)
        {
            _context.Disciplinas.Add(disciplina);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDisciplina), new { id = disciplina.Id }, disciplina);
        }

        // PUT: api/Disciplinas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDisciplina(int id, Disciplina disciplina)
        {
            if (id != disciplina.Id) return BadRequest(new { mensagem = "O ID não corresponde." });

            _context.Entry(disciplina).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DisciplinaExists(id)) return NotFound(new { mensagem = "Disciplina não encontrada." });
                throw;
            }

            return Ok(disciplina);
        }

        // DELETE: api/Disciplinas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDisciplina(int id)
        {
            var disciplina = await _context.Disciplinas.FindAsync(id);
            if (disciplina == null) return NotFound(new { mensagem = "Disciplina não encontrada." });

            _context.Disciplinas.Remove(disciplina);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Disciplina removida com sucesso." });
        }

        private bool DisciplinaExists(int id)
        {
            return _context.Disciplinas.Any(e => e.Id == id);
        }
    }
}