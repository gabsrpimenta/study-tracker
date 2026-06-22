using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Objetivo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public bool Done { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int EstudanteId { get; set; }
    }
}
