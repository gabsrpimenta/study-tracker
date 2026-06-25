using Microsoft.EntityFrameworkCore;
using StudyTrackerAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar o SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=studytracker.db"));

// 2. Ativar o CORS (Segurança para aceitar pedidos do Frontend)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// 3. Ativar os Controladores estruturados
builder.Services.AddControllers();

var app = builder.Build();

app.UseCors();
app.MapControllers();

app.Run();