using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CronogramasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CronogramasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Cronogramas
        // Agora com suporte a filtros de Estudante e Matéria
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cronograma>>> GetCronograma(
            [FromQuery] int? estudanteId = null,
            [FromQuery] int? materiaId = null)
        {
            var query = _context.Cronogramas.AsQueryable();

            // Filtra pelo ID do estudante (através da relação com Matéria)
            if (estudanteId.HasValue)
            {
                query = query.Where(c => c.Materia != null && c.Materia.EstudanteId == estudanteId.Value);
            }

            // Filtra pelo ID da matéria específica
            if (materiaId.HasValue)
            {
                query = query.Where(c => c.MateriaId == materiaId.Value);
            }

            // O .Include garante que o nome da Matéria venha junto na resposta JSON
            return await query.Include(c => c.Materia).ToListAsync();
        }

        // GET: api/Cronogramas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cronograma>> GetCronograma(int id)
        {
            var cronograma = await _context.Cronogramas
                .Include(c => c.Materia)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cronograma == null)
            {
                return NotFound("Cronograma não encontrado.");
            }

            return cronograma;
        }

        // PUT: api/Cronogramas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCronograma(int id, Cronograma cronograma)
        {
            if (id != cronograma.Id)
            {
                return BadRequest("O ID informado não coincide com o objeto.");
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
                    return NotFound("Cronograma não encontrado para atualização.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Cronogramas
        [HttpPost]
        public async Task<ActionResult<Cronograma>> PostCronograma(Cronograma cronograma)
        {
            _context.Cronogramas.Add(cronograma);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCronograma", new { id = cronograma.Id }, cronograma);
        }

        // DELETE: api/Cronogramas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCronograma(int id)
        {
            var cronograma = await _context.Cronogramas.FindAsync(id);
            if (cronograma == null)
            {
                return NotFound("Cronograma não encontrado para exclusão.");
            }

            _context.Cronogramas.Remove(cronograma);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CronogramaExists(int id)
        {
            return _context.Cronogramas.Any(e => e.Id == id);
        }
    }
}