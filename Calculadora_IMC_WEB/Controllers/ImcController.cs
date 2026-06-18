using Microsoft.AspNetCore.Mvc;
using Calculadora_IMC_WEB.Models;
using Calculadora_IMC_WEB.Services;

namespace Calculadora_IMC_WEB.Controllers
{
    /*
     * O Controlador é a porta de entrada da nossa API. Ele recebe requisições HTTP do frontend,
     * envia os dados para os Serviços processarem e devolve a resposta no formato JSON.
     * O atributo [ApiController] aplica comportamentos padrão de API, como validação automática.
     * O atributo [Route] define qual URL esse controlador responderá (neste caso, "api/imc").
     */
    [ApiController]
    [Route("api/[controller]")]
    public class ImcController : ControllerBase
    {
        // Armazenamos a interface do nosso serviço para não depender da implementação diretamente
        private readonly IImcCalculatorService _servicoImc;

        // Injeção de dependência via construtor: o ASP.NET cria e fornece automaticamente o ImcCalculatorService.
        public ImcController(IImcCalculatorService servicoImc)
        {
            _servicoImc = servicoImc;
        }

        /*
         * Endpoint do tipo POST. Utilizamos POST pois o cliente está enviando (submetendo) dados 
         * no corpo (body) da requisição para serem calculados.
         */
        [HttpPost("calcular")]
        public ActionResult<RespostaImc> Calcular([FromBody] RequisicaoImc requisicao)
        {
            // Validação de segurança: evitamos calcular se os valores forem absurdos ou zero.
            if (requisicao.Altura <= 0 || requisicao.Peso <= 0)
            {
                // Retorna um Erro 400 (Bad Request), avisando o frontend que os dados estão errados.
                return BadRequest("Altura e Peso devem ser maiores que zero.");
            }

            // Repassamos a tarefa complexa para nosso serviço dedicado
            var resultado = _servicoImc.CalcularImc(requisicao.Peso, requisicao.Altura);

            // Retornamos Código 200 (OK) enviando os dados JSON do resultado
            return Ok(resultado);
        }
    }
}
