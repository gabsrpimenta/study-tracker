using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerAPI.Data;
using StudyTrackerAPI.Models;

namespace StudyTrackerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GradesController : ControllerBase
{
    private readonly AppDbContext _db;
    public GradesController(AppDbContext db) { _db = db; }

    [HttpGet] public async Task<IActionResult> Get() => Ok(await _db.Grades.ToListAsync());
    
    [HttpPost] public async Task<IActionResult> Post(Grade grade) { _db.Grades.Add(grade); await _db.SaveChangesAsync(); return Ok(grade); }
    
    [HttpPut("{id}")] public async Task<IActionResult> Put(int id, Grade input) {
        var grade = await _db.Grades.FindAsync(id); // Corrigido para _db
        if (grade == null) return NotFound();
        grade.Title = input.Title; grade.Subject = input.Subject; grade.Value = input.Value; grade.Weight = input.Weight;
        await _db.SaveChangesAsync(); return Ok(grade);
    }
    
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) {
        var grade = await _db.Grades.FindAsync(id); // Corrigido para _db
        if (grade == null) return NotFound();
        _db.Grades.Remove(grade); await _db.SaveChangesAsync(); return NoContent();
    }
}