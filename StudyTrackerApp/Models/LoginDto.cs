using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    // Este molde define que, para fazer login ou cadastro, 
    // o sistema exige um e-mail válido e uma senha.
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Senha { get; set; } = string.Empty;
    }
}