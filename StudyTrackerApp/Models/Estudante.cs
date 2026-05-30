using System.ComponentModel.DataAnnotations;

namespace StudyTrackerApp.Models
{
    public class Estudante
    {
        public int Id { get; set; }

        [Required]
        public string Nome { get; set; } = string.Empty;

        // Adicionamos o Email como campo obrigatório para o Login
        [Required]
        [EmailAddress] // Garante que o formato seja um e-mail válido (ex@ex.com)
        public string Email { get; set; } = string.Empty;

        // Aqui guardamos a senha criptografada (Hash), nunca a senha real
        [Required]
        public string SenhaHash { get; set; } = string.Empty;
    }
}