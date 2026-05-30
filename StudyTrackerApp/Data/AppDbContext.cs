using Microsoft.EntityFrameworkCore;

namespace StudyTrackerApp.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Mapeamento das tabelas do banco de dados
        public DbSet<Estudante> Estudantes { get; set; }
        public DbSet<Materia> Materias { get; set; }
        public DbSet<Tarefa> Tarefas { get; set; }
        public DbSet<Cronograma> Cronogramas { get; set; }
    }
}