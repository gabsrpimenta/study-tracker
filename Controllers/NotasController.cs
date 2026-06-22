using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers;

// Este controller serve a página "Avaliações" (notas numéricas com valor e peso)
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotasController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotasController(AppDbContext context)
    {
        _context = context;
    }

    private int UserId =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _context.Notas
            .Where(x => x.EstudanteId == UserId)
            .ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Nota n)
    {
        n.EstudanteId = UserId;
        _context.Notas.Add(n);
        await _context.SaveChangesAsync();
        return Ok(n);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, Nota input)
    {
        var item = await _context.Notas
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        item.Subject = input.Subject;
        item.Title = input.Title;
        item.Value = input.Value;
        item.Weight = input.Weight;

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Notas
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        _context.Notas.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
