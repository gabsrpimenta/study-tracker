using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Banco de Dados SQLite (Essencial para as Migrations funcionarem!)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configuração do CORS (Para permitir que o React da Gabriella aceda à tua API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

builder.Services.AddControllers();

// Configuração do OpenAPI/Swagger
builder.Services.AddOpenApi();

var app = builder.Build();

// Configura o pipeline de requisições HTTP
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// 3. Ativar o CORS antes das rotas
app.UseCors("AllowReact");

app.UseAuthorization();

app.MapControllers();

app.Run();