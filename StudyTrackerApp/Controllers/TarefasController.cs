using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

[Route("api/[controller]")]
[ApiController]
public class TarefasController : ControllerBase
{
    private readonly AppDbContext _context;
    public TarefasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Tarefa
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefa()
    {
        return await _context.Tarefas.ToListAsync();
    }

    // GET: api/Tarefa/5
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

    // PUT: api/Tarefa/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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

    // POST: api/Tarefa
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Tarefa>> PostTarefa(Tarefa tarefa)
    {
        _context.Tarefas.Add(tarefa);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetTarefa", new { id = tarefa.Id }, tarefa);
    }

    // DELETE: api/Tarefa/5
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
