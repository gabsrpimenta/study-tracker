using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Cronograma
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Titulo { get; set; } = string.Empty;

        public string? Subtitulo { get; set; }

        public DateTime Data { get; set; }

        [Required]
        public string Tipo { get; set; } = string.Empty;

        public int DisciplinaId { get; set; }

        public Disciplina? Disciplina { get; set; }
    }
}