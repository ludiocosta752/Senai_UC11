using Calculadora_IMC_WEB.Services;

var builder = WebApplication.CreateBuilder(args);

// Adiciona os serviços essenciais para usar Controladores
builder.Services.AddControllers();

// Registra nosso serviço de cálculo de IMC para ser injetado nos controladores.
// Utilizamos Scoped pois os cálculos são rápidos e sem estado (stateless).
builder.Services.AddScoped<IImcCalculatorService, ImcCalculatorService>();

var app = builder.Build();

// Configurações do pipeline (middleware)
app.UseRouting();

// Habilita o uso de arquivos padrão (como index.html)
app.UseDefaultFiles();
// Habilita o servidor para entregar os arquivos estáticos (HTML, CSS, JS) que estão na pasta wwwroot
app.UseStaticFiles();

// Mapeia as rotas para os Controladores (API)
app.MapControllers();

app.Run();
