using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class CronogramasController : ControllerBase
{
    private readonly AppDbContext _context;

    public CronogramasController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
        => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();

        var data = await _context.Cronogramas
            .Include(c => c.Disciplina)
            .Where(c => c.Disciplina!.EstudanteId == userId)
            .ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Cronograma cronograma)
    {
        var userId = GetUserId();

        var valid = await _context.Disciplinas
            .AnyAsync(d => d.Id == cronograma.DisciplinaId && d.EstudanteId == userId);

        if (!valid)
            return BadRequest("Disciplina inválida");

        _context.Cronogramas.Add(cronograma);
        await _context.SaveChangesAsync();

        return Ok(cronograma);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        // Verifica posse via disciplina associada
        var item = await _context.Cronogramas
            .Include(c => c.Disciplina)
            .FirstOrDefaultAsync(c => c.Id == id && c.Disciplina!.EstudanteId == userId);

        if (item == null) return NotFound();

        _context.Cronogramas.Remove(item);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
