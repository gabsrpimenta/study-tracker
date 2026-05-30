using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    // Molde usado para receber os dados de login e cadastro
    public class LoginDto
    {
        // E-mail do usuário (deve ser um formato de e-mail válido)
        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        // Senha digitada pelo usuário no formulário
        [Required(ErrorMessage = "A senha é obrigatória.")]
        public string Senha { get; set; } = string.Empty;
    }
}