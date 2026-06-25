using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerAPI.Data;
using StudyTrackerAPI.Models;

namespace StudyTrackerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _db;
    public EventsController(AppDbContext db) { _db = db; }

    [HttpGet] public async Task<IActionResult> Get() => Ok(await _db.Events.ToListAsync());
    
    [HttpPost] public async Task<IActionResult> Post(StudyEvent ev) { _db.Events.Add(ev); await _db.SaveChangesAsync(); return Ok(ev); }
    
    [HttpPut("{id}")] public async Task<IActionResult> Put(int id, StudyEvent input) {
        var ev = await _db.Events.FindAsync(id); // Corrigido para _db
        if (ev == null) return NotFound();
        ev.Name = input.Name; ev.Subject = input.Subject; ev.Date = input.Date; ev.Type = input.Type;
        await _db.SaveChangesAsync(); return Ok(ev);
    }
    
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) {
        var ev = await _db.Events.FindAsync(id); // Corrigido para _db
        if (ev == null) return NotFound();
        _db.Events.Remove(ev); await _db.SaveChangesAsync(); return NoContent();
    }
}