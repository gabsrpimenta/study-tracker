using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Tarefa
    {
        // Identificação única no banco de dados
        [Key]
        public int Id { get; set; }

        // Descrição do que precisa ser feito
        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(200, ErrorMessage = "A descrição não pode exceder 200 caracteres.")]
        public string Descricao { get; set; } = string.Empty;

        // Data limite ou agendada para a tarefa
        [Required]
        public DateTime Data { get; set; } = DateTime.Today;

        // Indica se a tarefa foi finalizada (padrão é não concluída)
        public bool Concluida { get; set; } = false;

        // Identifica o estudante dono da tarefa
        [Required]
        public int EstudanteId { get; set; }
        public Estudante? Estudante { get; set; }
    }
}