using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Materia
    {
        // Identificação única no banco de dados
        [Key]
        public int Id { get; set; }

        // Nome da matéria
        [Required(ErrorMessage = "O nome da matéria é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        // Define se a matéria está visível/ativa no sistema
        public bool Ativa { get; set; } = true;

        // Identifica a qual estudante esta matéria pertence
        [Required]
        public int EstudanteId { get; set; }
        public Estudante? Estudante { get; set; }

        // Lista de eventos vinculados a esta matéria
        public List<Cronograma> Cronogramas { get; set; } = new();
    }
}