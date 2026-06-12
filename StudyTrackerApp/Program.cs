using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudyTrackerApp.Models;
using System.Text;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurações de Serviços
QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("uma_chave_muito_longa_e_secreta_para_seguranca_12345")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// 2. Configuração do Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    // Apenas redireciona para HTTPS se não estiver em desenvolvimento
    app.UseHttpsRedirection();
}

app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();