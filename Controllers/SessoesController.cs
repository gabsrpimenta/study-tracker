using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SessoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SessoesController(AppDbContext context)
    {
        _context = context;
    }

    private int UserId =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _context.Sessoes
            .Where(x => x.EstudanteId == UserId)
            .ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Sessao s)
    {
        s.EstudanteId = UserId;
        _context.Sessoes.Add(s);
        await _context.SaveChangesAsync();
        return Ok(s);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Sessoes
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == UserId);

        if (item == null) return NotFound();

        _context.Sessoes.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
