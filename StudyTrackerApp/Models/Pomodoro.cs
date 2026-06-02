using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Pomodoro
    {
        [Key]
        public int Id { get; set; }

        public int DuracaoMinutos { get; set; } = 25;

        public DateTime DataConclusao { get; set; } = DateTime.Now;

        [Required]
        public int MateriaId { get; set; }
        public Materia? Materia { get; set; }

        [Required]
        public int EstudanteId { get; set; }
        public Estudante? Estudante { get; set; }
    }
}