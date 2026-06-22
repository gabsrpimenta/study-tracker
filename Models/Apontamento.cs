using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Apontamento
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Subject { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int EstudanteId { get; set; }
    }
}
