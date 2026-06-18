namespace Calculadora_IMC_WEB.Models
{
    /*
     * Modelo que representa os dados que o cliente envia para a API.
     * Contém o Peso e a Altura do usuário.
     */
    public class RequisicaoImc
    {
        public double Peso { get; set; }
        public double Altura { get; set; }
    }

    /*
     * Modelo que representa uma faixa de classificação de IMC e os pesos correspondentes.
     */
    public class FaixaPeso
    {
        public string Classificacao { get; set; } = string.Empty;
        public double? PesoMinimo { get; set; }
        public double? PesoMaximo { get; set; }
        public string Cor { get; set; } = string.Empty;
    }

    /*
     * Modelo de resposta que será retornado para o frontend em formato JSON.
     */
    public class RespostaImc
    {
        public double Imc { get; set; }
        public string Classificacao { get; set; } = string.Empty;
        public List<FaixaPeso> TabelaClassificacoes { get; set; } = new();
    }
}
