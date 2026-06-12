using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Controllers
{
    [Authorize] // Garante que só usuários logados tocam nesses dados
    [Route("api/[controller]")]
    [ApiController]
    public class TarefasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TarefasController(AppDbContext context) => _context = context;

        // Pega o ID do usuário direto do token, sem confiar em parâmetros do cliente
        private int GetEstudanteId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefas([FromQuery] bool? concluida)
        {
            var estudanteId = GetEstudanteId();

            // AsNoTracking: melhora a performance em consultas, já que não vamos editar nada aqui
            var query = _context.Tarefas.AsNoTracking().Where(t => t.EstudanteId == estudanteId);

            if (concluida.HasValue) query = query.Where(t => t.Concluida == concluida.Value);

            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Tarefa>> GetTarefa(int id)
        {
            var estudanteId = GetEstudanteId();

            // Busca apenas se a tarefa for do dono, impedindo acesso de usuários estranhos
            var tarefa = await _context.Tarefas.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id && t.EstudanteId == estudanteId);

            if (tarefa == null) return NotFound("Tarefa não encontrada.");

            return tarefa;
        }

        [HttpPost]
        public async Task<ActionResult<Tarefa>> PostTarefa(Tarefa tarefa)
        {
            // O servidor garante a autoria, não confiamos no que o front-end envia
            tarefa.EstudanteId = GetEstudanteId();

            _context.Tarefas.Add(tarefa);
            await _context.SaveChangesAsync();

            // Retorna o link para o GET deste recurso (seguindo padrão REST)
            return CreatedAtAction(nameof(GetTarefa), new { id = tarefa.Id }, tarefa);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTarefa(int id, Tarefa tarefa)
        {
            var estudanteId = GetEstudanteId();

            // Valida se o ID da rota bate com o corpo e se o estudante é realmente o dono
            if (id != tarefa.Id || tarefa.EstudanteId != estudanteId)
                return BadRequest("ID inválido ou sem permissão.");

            _context.Entry(tarefa).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Tarefas.Any(t => t.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpPatch("{id}/alternar-conclusao")]
        public async Task<IActionResult> AlternarConclusao(int id)
        {
            var estudanteId = GetEstudanteId();

            // Busca a tarefa garantindo que ela pertence ao dono da sessão
            var tarefa = await _context.Tarefas.FirstOrDefaultAsync(t => t.Id == id && t.EstudanteId == estudanteId);

            if (tarefa == null) return NotFound("Tarefa não encontrada.");

            // Inverte o status atual (toggle)
            tarefa.Concluida = !tarefa.Concluida;
            await _context.SaveChangesAsync();

            return Ok(new { id = tarefa.Id, concluida = tarefa.Concluida });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTarefa(int id)
        {
            var estudanteId = GetEstudanteId();

            // Verifica existência e propriedade antes de deletar
            var tarefa = await _context.Tarefas.FirstOrDefaultAsync(t => t.Id == id && t.EstudanteId == estudanteId);

            if (tarefa == null) return NotFound("Tarefa não encontrada.");

            _context.Tarefas.Remove(tarefa);
            await _context.SaveChangesAsync();

            return NoContent(); // 204: Sucesso, mas sem corpo (padrão REST)
        }
    }
}