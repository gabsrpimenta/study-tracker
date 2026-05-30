using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

[Route("api/[controller]")]
[ApiController]
public class MateriasController : ControllerBase
{
    private readonly AppDbContext _context;
    public MateriasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Materia
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Materia>>> GetMateria()
    {
        return await _context.Materias.ToListAsync();
    }

    // GET: api/Materia/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Materia>> GetMateria(int id)
    {
        var materia = await _context.Materias.FindAsync(id);

        if (materia == null)
        {
            return NotFound();
        }

        return materia;
    }

    // PUT: api/Materia/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutMateria(int? id, Materia materia)
    {
        if (id != materia.Id)
        {
            return BadRequest();
        }

        _context.Entry(materia).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MateriaExists(id))
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

    // POST: api/Materia
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Materia>> PostMateria(Materia materia)
    {
        _context.Materias.Add(materia);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetMateria", new { id = materia.Id }, materia);
    }

    // DELETE: api/Materia/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMateria(int? id)
    {
        var materia = await _context.Materias.FindAsync(id);
        if (materia == null)
        {
            return NotFound();
        }

        _context.Materias.Remove(materia);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MateriaExists(int? id)
    {
        return _context.Materias.Any(e => e.Id == id);
    }
}
