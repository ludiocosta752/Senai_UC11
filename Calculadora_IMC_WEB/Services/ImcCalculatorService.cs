using Calculadora_IMC_WEB.Models;

namespace Calculadora_IMC_WEB.Services
{
    /*
     * Interface para definir o contrato do nosso serviço.
     * Isso é importante para conseguirmos "mockar" (simular) este serviço em testes de software futuramente.
     */
    public interface IImcCalculatorService
    {
        RespostaImc CalcularImc(double peso, double altura);
        string ObterClassificacao(double imc);
    }

    /*
     * Serviço responsável por toda a lógica de negócio (cálculos) do IMC.
     * Isolamos a lógica aqui para que os Controladores fiquem limpos e apenas recebam/entreguem requisições.
     */
    public class ImcCalculatorService : IImcCalculatorService
    {
        public RespostaImc CalcularImc(double peso, double altura)
        {
            // O cálculo do IMC é: peso dividido pela altura ao quadrado.
            double imc = peso / (altura * altura);
            
            // Arredondamos para 2 casas decimais para facilitar a visualização
            imc = Math.Round(imc, 2);

            var resposta = new RespostaImc
            {
                Imc = imc,
                Classificacao = ObterClassificacao(imc),
                TabelaClassificacoes = GerarTabelaClassificacoes(altura)
            };

            return resposta;
        }

        /*
         * Com base no valor do IMC calculado, retorna a classificação de texto correspondente.
         */
        public string ObterClassificacao(double imc)
        {
            if (imc < 18.5) return "Abaixo do peso";
            if (imc < 25) return "Peso normal";
            if (imc < 30) return "Sobrepeso";
            if (imc < 35) return "Obesidade Grau I";
            if (imc < 40) return "Obesidade Grau II";
            return "Obesidade Grau III";
        }

        /*
         * Gera uma tabela com base na altura da pessoa, calculando o peso exato (mínimo e máximo) 
         * para cada faixa de classificação. 
         */
        private List<FaixaPeso> GerarTabelaClassificacoes(double altura)
        {
            // O cálculo reverso para achar o peso é: peso = IMC * (altura * altura)
            double multiplicador = altura * altura;

            return new List<FaixaPeso>
            {
                new FaixaPeso 
                { 
                    Classificacao = "Abaixo do peso", 
                    PesoMinimo = null, 
                    PesoMaximo = Math.Round(18.49 * multiplicador, 1),
                    Cor = "#ffc107" // Amarelo (Aviso leve)
                },
                new FaixaPeso 
                { 
                    Classificacao = "Peso normal", 
                    PesoMinimo = Math.Round(18.5 * multiplicador, 1), 
                    PesoMaximo = Math.Round(24.99 * multiplicador, 1),
                    Cor = "#28a745" // Verde (Ideal)
                },
                new FaixaPeso 
                { 
                    Classificacao = "Sobrepeso", 
                    PesoMinimo = Math.Round(25.0 * multiplicador, 1), 
                    PesoMaximo = Math.Round(29.99 * multiplicador, 1),
                    Cor = "#fd7e14" // Laranja (Atenção)
                },
                new FaixaPeso 
                { 
                    Classificacao = "Obesidade Grau I", 
                    PesoMinimo = Math.Round(30.0 * multiplicador, 1), 
                    PesoMaximo = Math.Round(34.99 * multiplicador, 1),
                    Cor = "#dc3545" // Vermelho Claro (Perigo)
                },
                new FaixaPeso 
                { 
                    Classificacao = "Obesidade Grau II", 
                    PesoMinimo = Math.Round(35.0 * multiplicador, 1), 
                    PesoMaximo = Math.Round(39.99 * multiplicador, 1),
                    Cor = "#c82333" // Vermelho Médio (Perigo elevado)
                },
                new FaixaPeso 
                { 
                    Classificacao = "Obesidade Grau III", 
                    PesoMinimo = Math.Round(40.0 * multiplicador, 1), 
                    PesoMaximo = null,
                    Cor = "#721c24" // Vermelho Escuro (Risco Extremo)
                }
            };
        }
    }
}
