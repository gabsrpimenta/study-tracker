using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EventosController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventosController(AppDbContext context)
    {
        _context = context;
    }

    private int UserId =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _context.Eventos
            .Where(x => x.EstudanteId == UserId)
            .ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Evento e)
    {
        e.EstudanteId = UserId;
        _context.Eventos.Add(e);
        await _context.SaveChangesAsync();
        return Ok(e);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, Evento input)
    {
        var item = await _context.Eventos
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        item.Titulo = input.Titulo;
        item.Data = input.Data;
        item.Subject = input.Subject;
        item.Type = input.Type;

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Eventos
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        _context.Eventos.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
