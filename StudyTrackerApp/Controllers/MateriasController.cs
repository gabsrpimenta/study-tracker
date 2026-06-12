using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MateriasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MateriasController(AppDbContext context)
        {
            _context = context;
        }

        // Obtém o ID do estudante a partir do token JWT
        private int GetEstudanteId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        // GET: api/Materias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Materia>>> GetMateria()
        {
            var estudanteId = GetEstudanteId();

            var materias = await _context.Materias
                .AsNoTracking()
                .Where(m => m.EstudanteId == estudanteId)
                .ToListAsync();

            return Ok(materias);
        }

        // POST: api/Materias
        [HttpPost]
        public async Task<ActionResult<Materia>> PostMateria(Materia materia)
        {
            materia.EstudanteId = GetEstudanteId();

            _context.Materias.Add(materia);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMateria), new { id = materia.Id }, materia);
        }

        // PUT: api/Materias/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMateria(int id, Materia materia)
        {
            var estudanteId = GetEstudanteId();

            var materiaExistente = await _context.Materias
                .FirstOrDefaultAsync(m => m.Id == id && m.EstudanteId == estudanteId);

            if (materiaExistente == null)
                return NotFound("Matéria não encontrada.");

            materiaExistente.Nome = materia.Nome;
            materiaExistente.Ativa = materia.Ativa;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Materias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMateria(int id)
        {
            var estudanteId = GetEstudanteId();

            var materia = await _context.Materias
                .FirstOrDefaultAsync(m => m.Id == id && m.EstudanteId == estudanteId);

            if (materia == null)
                return NotFound("Matéria não encontrada.");

            _context.Materias.Remove(materia);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}