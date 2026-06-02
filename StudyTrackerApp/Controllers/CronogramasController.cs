using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CronogramasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CronogramasController(AppDbContext context) => _context = context;
        private int GetEstudanteId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cronograma>>> GetCronograma([FromQuery] int? materiaId = null)
        {
            var estudanteId = GetEstudanteId();
            var query = _context.Cronogramas
                .Include(c => c.Materia)
                .Where(c => c.Materia != null && c.Materia.EstudanteId == estudanteId);

            if (materiaId.HasValue)
                query = query.Where(c => c.MateriaId == materiaId.Value);

            return await query.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Cronograma>> PostCronograma(Cronograma cronograma)
        {
            // Opcional: Validar se a matéria selecionada pertence ao usuário antes de salvar
            _context.Cronogramas.Add(cronograma);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetCronograma", new { id = cronograma.Id }, cronograma);
        }

        // ... manter os outros métodos, garantindo sempre o filtro estudanteId nas consultas
    }
}