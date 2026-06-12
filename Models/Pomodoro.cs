using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    /// <summary>
    /// Representa a sessão de foco Pomodoro realizada pelo estudante.
    /// Utilizada para monitorar o tempo de estudo e produtividade.
    /// </summary>
    public class Pomodoro
    {
        // Identificador primário (Chave Primária no banco de dados)
        [Key]
        public int Id { get; set; }

        // Validação: Garante que a sessão tenha uma duração lógica (ex: entre 1 e 120 minutos)
        [Required(ErrorMessage = "A duração é obrigatória.")]
        [Range(1, 120, ErrorMessage = "A duração deve ser entre 1 e 120 minutos.")]
        public int DuracaoMinutos { get; set; } = 25;

        // Data de registro da conclusão da sessão
        [Required(ErrorMessage = "A data de conclusão é obrigatória.")]
        public DateTime DataConclusao { get; set; } = DateTime.Now;

        // Relacionamento: Vincula o Pomodoro a uma matéria específica
        // O uso do [Required] ajuda o Entity Framework a definir a coluna como NOT NULL
        [Required(ErrorMessage = "É necessário associar uma matéria ao Pomodoro.")]
        public int MateriaId { get; set; }
        public Materia? Materia { get; set; }

        // Relacionamento: Identifica quem realizou a sessão
        [Required(ErrorMessage = "O estudante é obrigatório.")]
        public int EstudanteId { get; set; }
        public Estudante? Estudante { get; set; }
    }
}