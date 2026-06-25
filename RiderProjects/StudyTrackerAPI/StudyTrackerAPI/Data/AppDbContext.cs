using Microsoft.EntityFrameworkCore;
using StudyTrackerAPI.Models;

namespace StudyTrackerAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<StudyTask> Tasks { get; set; }
    public DbSet<StudyEvent> Events { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Grade> Grades { get; set; }
    public DbSet<StudySession> Sessions { get; set; }
    public DbSet<Goal> Goals { get; set; }
}