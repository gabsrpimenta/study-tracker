using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MateriasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public MateriasController(AppDbContext context) => _context = context;

        // Pega o ID direto do token para garantir que o usuário só mexa nas matérias dele
        private int GetEstudanteId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Materia>>> GetMateria()
        {
            var estudanteId = GetEstudanteId();

            // Lista apenas as matérias que pertencem ao estudante logado
            return await _context.Materias
                .AsNoTracking()
                .Where(m => m.EstudanteId == estudanteId)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Materia>> PostMateria(Materia materia)
        {
            // O servidor define o dono da matéria, ignorando qualquer ID que venha do front
            materia.EstudanteId = GetEstudanteId();

            _context.Materias.Add(materia);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMateria), new { id = materia.Id }, materia);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMateria(int id)
        {
            var estudanteId = GetEstudanteId();

            // Busca a matéria verificando se ela realmente pertence ao estudante
            var materia = await _context.Materias
                .FirstOrDefaultAsync(m => m.Id == id && m.EstudanteId == estudanteId);

            if (materia == null) return NotFound("Matéria não encontrada.");

            _context.Materias.Remove(materia);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}