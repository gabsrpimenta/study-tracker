using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerAPI.Data;
using StudyTrackerAPI.Models;

namespace StudyTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GoalsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GoalsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Goal>>> GetGoals() => await _context.Goals.ToListAsync();

        [HttpPost]
        public async Task<ActionResult<Goal>> PostGoal(Goal goal)
        {
            _context.Goals.Add(goal);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGoals), new { id = goal.Id }, goal);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var goal = await _context.Goals.FindAsync(id);
            if (goal == null) return NotFound();
            _context.Goals.Remove(goal);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}