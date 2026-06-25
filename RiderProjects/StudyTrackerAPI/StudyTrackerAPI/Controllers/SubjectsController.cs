using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerAPI.Data;
using StudyTrackerAPI.Models;

namespace StudyTrackerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SubjectsController(AppDbContext db) { _db = db; }

    [HttpGet] public async Task<IActionResult> Get() => Ok(await _db.Subjects.ToListAsync());
    
    [HttpPost] public async Task<IActionResult> Post(Subject sub) { _db.Subjects.Add(sub); await _db.SaveChangesAsync(); return Ok(sub); }
    
    [HttpPut("{id}")] public async Task<IActionResult> Put(int id, Subject input) {
        var sub = await _db.Subjects.FindAsync(id); // Corrigido para _db
        if (sub == null) return NotFound();
        sub.Nome = input.Nome; sub.Professor = input.Professor; sub.Progresso = input.Progresso;
        await _db.SaveChangesAsync(); return Ok(sub);
    }
    
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) {
        var sub = await _db.Subjects.FindAsync(id); // Corrigido para _db
        if (sub == null) return NotFound();
        _db.Subjects.Remove(sub); await _db.SaveChangesAsync(); return NoContent();
    }
}