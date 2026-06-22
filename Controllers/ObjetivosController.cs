using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ObjetivosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ObjetivosController(AppDbContext context)
    {
        _context = context;
    }

    private int UserId =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _context.Objetivos
            .Where(x => x.EstudanteId == UserId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Objetivo o)
    {
        o.EstudanteId = UserId;
        o.CreatedAt = DateTime.UtcNow;
        _context.Objetivos.Add(o);
        await _context.SaveChangesAsync();
        return Ok(o);
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> Toggle(int id)
    {
        var item = await _context.Objetivos
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        item.Done = !item.Done;
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Objetivos
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        _context.Objetivos.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
