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

            // Carregamos a Matéria junto (Include) para o front-end ter os dados completos.
            // Filtramos pela matéria para garantir que o estudante só veja os próprios cronogramas.
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
            // Segurança: Antes de salvar, conferimos se a matéria pertence mesmo a quem está logado.
            // Isso evita que um usuário envie um MateriaId de outra pessoa.
            var materiaEhDoUsuario = await _context.Materias
                .AnyAsync(m => m.Id == cronograma.MateriaId && m.EstudanteId == GetEstudanteId());

            if (!materiaEhDoUsuario)
                return BadRequest("Essa matéria não pertence a você.");

            _context.Cronogramas.Add(cronograma);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCronograma), new { id = cronograma.Id }, cronograma);
        }
    }
}