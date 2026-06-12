using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Estudante
    {
        // Identificação única na Base de dados
        [Key]
        public int Id { get; set; }

        // Nome do estudante
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        // E-mail usado para login (formato deve ser válido)
        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        // Senha salva como código (hash) por segurança
        [Required]
        public string SenhaHash { get; set; } = string.Empty;
    }
}