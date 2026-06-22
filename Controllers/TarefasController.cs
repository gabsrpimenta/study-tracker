using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;
using System.Security.Claims;

namespace StudyTrackerApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class TarefasController : ControllerBase
{
    private readonly AppDbContext _context;

    public TarefasController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
        => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();
        var data = await _context.Tarefas
            .Where(t => t.EstudanteId == userId)
            .ToListAsync();
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Tarefa tarefa)
    {
        tarefa.EstudanteId = GetUserId();
        _context.Tarefas.Add(tarefa);
        await _context.SaveChangesAsync();
        return Ok(tarefa);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, Tarefa input)
    {
        var userId = GetUserId();
        var tarefa = await _context.Tarefas
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == userId);

        if (tarefa == null) return NotFound();

        tarefa.Titulo = input.Titulo;
        tarefa.Data = input.Data;
        tarefa.Concluida = input.Concluida;
        tarefa.Subject = input.Subject;
        tarefa.Priority = input.Priority;
        tarefa.Due = input.Due;

        await _context.SaveChangesAsync();
        return Ok(tarefa);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Toggle(int id)
    {
        var userId = GetUserId();
        var tarefa = await _context.Tarefas
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == userId);

        if (tarefa == null) return NotFound();

        tarefa.Concluida = !tarefa.Concluida;
        await _context.SaveChangesAsync();
        return Ok(tarefa);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var tarefa = await _context.Tarefas
            .FirstOrDefaultAsync(x => x.Id == id && x.EstudanteId == userId);

        if (tarefa == null) return NotFound();

        _context.Tarefas.Remove(tarefa);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
