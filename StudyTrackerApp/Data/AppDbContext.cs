using Microsoft.EntityFrameworkCore;

namespace StudyTrackerApp.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Representam as tabelas no Banco de Dados
        public DbSet<Estudante> Estudantes { get; set; }
        public DbSet<Materia> Materias { get; set; }
        public DbSet<Tarefa> Tarefas { get; set; }
        public DbSet<Cronograma> Cronogramas { get; set; }
        public DbSet<Pomodoro> Pomodoros { get; set; }

        // O método OnModelCreating permite configurar o comportamento do banco de dados
        // via "Fluent API", que é uma forma mais poderosa e flexível que apenas Data Annotations.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Exemplo de configuração: garantir que o nome da tabela no banco seja pluralizado corretamente
            // e configurar comportamentos de deleção (Cascade Delete)

            modelBuilder.Entity<Pomodoro>()
                .HasOne(p => p.Materia)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict); // Evita exclusão acidental em cascata de matérias
        }
    }
}