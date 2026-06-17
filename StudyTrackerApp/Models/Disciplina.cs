using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StudyTrackerApp.Models
{
    public class Disciplina
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome da disciplina é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        public string? Professor { get; set; }

        public bool Ativa { get; set; } = true;

        public int EstudanteId { get; set; }

        // Relacionamento: Uma disciplina pode ter muitas tarefas
        [JsonIgnore]
        public ICollection<Tarefa> ListaTarefas { get; set; } = new List<Tarefa>();
    }
}