using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Cronograma
    {
        // Identificação única no banco de dados
        [Key]
        public int Id { get; set; }

        // Nome da tarefa, campo obrigatório para não salvar tarefa sem nome
        [Required(ErrorMessage = "O título é obrigatório.")]
        public string Titulo { get; set; } = string.Empty;

        // Uma descrição curta extra (opcional)
        public string Subtitulo { get; set; } = string.Empty;

        // Dia e hora que o evento vai acontecer
        [Required]
        public DateTime Data { get; set; }

        // Tipo da tarefa 
        [Required(ErrorMessage = "O tipo do evento é obrigatório.")]
        public string Tipo { get; set; } = string.Empty;

        // Liga esse evento a uma matéria específica
        [Required]
        public int MateriaId { get; set; }
        public Materia? Materia { get; set; }
    }
}