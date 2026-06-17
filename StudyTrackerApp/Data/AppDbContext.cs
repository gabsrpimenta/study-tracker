using Microsoft.EntityFrameworkCore;

namespace StudyTrackerApp.Models
{
    // O DbContext é a ponte principal entre o código C# e o banco de dados (o coração do EF Core)
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Representam as tabelas no Banco de Dados
        public DbSet<Estudante> Estudantes { get; set; }
        public DbSet<Materia> Materias { get; set; }
        public DbSet<Tarefa> Tarefas { get; set; }
        public DbSet<Cronograma> Cronogramas { get; set; }
        public DbSet<Pomodoro> Pomodoros { get; set; }
        
        public DbSet<Disciplina> Disciplinas { get; set; }

        // O OnModelCreating é usado para configurar relacionamentos e comportamentos complexos
        // que as Data Annotations simples não conseguem resolver sozinhas.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Regra de integridade referencial: 
            // Impedimos que o banco delete automaticamente uma Matéria se existirem Pomodoros vinculados a ela.
            // Isso evita a perda de histórico de estudos por erro de exclusão.
            modelBuilder.Entity<Pomodoro>()
                .HasOne(p => p.Materia)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}