using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers;

// Este controller serve a página "Notas" (editor de texto com título, disciplina e conteúdo)
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ApontamentosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ApontamentosController(AppDbContext context)
    {
        _context = context;
    }

    private int UserId =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _context.Apontamentos
            .Where(x => x.EstudanteId == UserId)
            .OrderByDescending(x => x.UpdatedAt)
            .ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Apontamento a)
    {
        a.EstudanteId = UserId;
        a.UpdatedAt = DateTime.UtcNow;
        _context.Apontamentos.Add(a);
        await _context.SaveChangesAsync();
        return Ok(a);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, Apontamento input)
    {
        var item = await _context.Apontamentos
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        item.Title = input.Title;
        item.Subject = input.Subject;
        item.Content = input.Content;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Apontamentos
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        _context.Apontamentos.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
