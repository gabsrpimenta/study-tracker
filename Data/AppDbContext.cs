using Microsoft.EntityFrameworkCore;

namespace StudyTrackerApp.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Estudante> Estudantes { get; set; }
        public DbSet<Disciplina> Disciplinas { get; set; }
        public DbSet<Tarefa> Tarefas { get; set; }
        public DbSet<Cronograma> Cronogramas { get; set; }
        public DbSet<Sessao> Sessoes { get; set; }
        public DbSet<Evento> Eventos { get; set; }

        // Avaliações numéricas (value + weight)
        public DbSet<Nota> Notas { get; set; }

        // Apontamentos de texto (title + subject + content)
        public DbSet<Apontamento> Apontamentos { get; set; }

        // Objetivos/Metas
        public DbSet<Objetivo> Objetivos { get; set; }
    }
}
