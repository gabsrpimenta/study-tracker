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
        private int GetEstudanteId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Materia>>> GetMateria()
        {
            var estudanteId = GetEstudanteId();
            return await _context.Materias.Where(m => m.EstudanteId == estudanteId).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Materia>> PostMateria(Materia materia)
        {
            materia.EstudanteId = GetEstudanteId(); // Garante a posse
            _context.Materias.Add(materia);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetMateria", new { id = materia.Id }, materia);
        }

        // ... manter os outros métodos (Put/Delete) adicionando o filtro GetEstudanteId() nos filtros de busca
    }
}