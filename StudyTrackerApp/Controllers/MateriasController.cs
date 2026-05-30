using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MateriasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MateriasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Materias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Materia>>> GetMateria()
        {
            // Retorna todas as matérias cadastradas
            return await _context.Materias.ToListAsync();
        }

        // GET: api/Materias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Materia>> GetMateria(int id)
        {
            // Busca uma matéria específica pelo ID
            var materia = await _context.Materias.FindAsync(id);

            if (materia == null)
            {
                return NotFound("Matéria não encontrada.");
            }

            return materia;
        }

        // PUT: api/Materias/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMateria(int id, Materia materia)
        {
            if (id != materia.Id)
            {
                return BadRequest("O ID informado não coincide com o objeto.");
            }

            // Atualiza o estado da entidade no Entity Framework
            _context.Entry(materia).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MateriaExists(id))
                {
                    return NotFound("Matéria não encontrada para atualização.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Materias
        [HttpPost]
        public async Task<ActionResult<Materia>> PostMateria(Materia materia)
        {
            // Cria uma nova matéria no banco de dados
            _context.Materias.Add(materia);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMateria", new { id = materia.Id }, materia);
        }

        // DELETE: api/Materias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMateria(int id)
        {
            // Remove a matéria com base no ID
            var materia = await _context.Materias.FindAsync(id);
            if (materia == null)
            {
                return NotFound("Matéria não encontrada para exclusão.");
            }

            _context.Materias.Remove(materia);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MateriaExists(int id)
        {
            return _context.Materias.Any(e => e.Id == id);
        }
    }
}