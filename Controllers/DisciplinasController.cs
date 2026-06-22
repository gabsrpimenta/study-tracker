using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // ESSENCIAL para ToListAsync e FirstOrDefaultAsync
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DisciplinasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DisciplinasController(AppDbContext context)
        {
            _context = context;
        }

        // Obtém o ID do usuário logado através do token JWT
        private int UserId =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var data = await _context.Disciplinas
                .Where(x => x.EstudanteId == UserId)
                .ToListAsync(); // Agora o compilador reconhecerá este método

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Post(Disciplina d)
        {
            d.EstudanteId = UserId;

            _context.Disciplinas.Add(d);
            await _context.SaveChangesAsync();

            return Ok(d);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Disciplina input)
        {
            var item = await _context.Disciplinas
                .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

            if (item == null) return NotFound();

            item.Nome = input.Nome;
            item.Professor = input.Professor;
            item.Ativa = input.Ativa;
            item.Tarefas = input.Tarefas;
            item.Progresso = input.Progresso;

            await _context.SaveChangesAsync();

            return Ok(item);
        
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Disciplinas
                .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

            if (item == null) return NotFound();

            _context.Disciplinas.Remove(item);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}