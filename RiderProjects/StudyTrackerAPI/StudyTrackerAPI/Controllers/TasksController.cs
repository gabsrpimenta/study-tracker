using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerAPI.Data;
using StudyTrackerAPI.Models;

namespace StudyTrackerAPI.Controllers;

[ApiController]
[Route("api/[controller]")] // Rota automática para: api/tasks
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
        var tasks = await _db.Tasks.ToListAsync();
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(StudyTask task)
    {
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return Ok(task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, StudyTask input)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        task.Title = input.Title;
        task.Subject = input.Subject;
        task.Due = input.Due;
        task.Priority = input.Priority;
        task.Done = input.Done;

        await _db.SaveChangesAsync();
        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent(); // 204 Sucesso sem conteúdo (perfeito para o teu api.js)
    }
}