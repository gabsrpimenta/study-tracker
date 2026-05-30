using Microsoft.EntityFrameworkCore;
using StudyTrackerApp.Models;

var builder = WebApplication.CreateBuilder(args);

// Configuração do banco de dados SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configuração do CORS para o React conseguir acessar a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

builder.Services.AddControllers();

// Ativa a documentação do Swagger/OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// Configurações exclusivas para o ambiente de desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Ativa o CORS e as rotas dos controladores
app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

app.Run();