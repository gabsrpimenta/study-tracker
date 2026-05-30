using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

[Route("api/[controller]")]
[ApiController]
public class CronogramasController : ControllerBase
{
    private readonly AppDbContext _context;
    public CronogramasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Cronograma
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cronograma>>> GetCronograma()
    {
        return await _context.Cronogramas.ToListAsync();
    }

    // GET: api/Cronograma/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Cronograma>> GetCronograma(int id)
    {
        var cronograma = await _context.Cronogramas.FindAsync(id);

        if (cronograma == null)
        {
            return NotFound();
        }

        return cronograma;
    }

    // PUT: api/Cronograma/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCronograma(int? id, Cronograma cronograma)
    {
        if (id != cronograma.Id)
        {
            return BadRequest();
        }

        _context.Entry(cronograma).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CronogramaExists(id))
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

    // POST: api/Cronograma
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Cronograma>> PostCronograma(Cronograma cronograma)
    {
        _context.Cronogramas.Add(cronograma);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetCronograma", new { id = cronograma.Id }, cronograma);
    }

    // DELETE: api/Cronograma/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCronograma(int? id)
    {
        var cronograma = await _context.Cronogramas.FindAsync(id);
        if (cronograma == null)
        {
            return NotFound();
        }

        _context.Cronogramas.Remove(cronograma);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CronogramaExists(int? id)
    {
        return _context.Cronogramas.Any(e => e.Id == id);
    }
}
