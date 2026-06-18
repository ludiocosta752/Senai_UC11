/**
 * Arquivo isolado de scripts.
 * O escopo aqui lida apenas com interações com o usuário e requisições para nossa API C#.
 */

// Esperamos o DOM (a estrutura do HTML) ser totalmente carregado antes de ligar os eventos
document.addEventListener("DOMContentLoaded", () => {
    
    const formulario = document.getElementById("formularioImc");
    const recipienteResultado = document.getElementById("recipienteResultado");
    const rotuloValorImc = document.getElementById("valorImc");
    const rotuloClassificacaoImc = document.getElementById("classificacaoImc");
    const corpoTabela = document.getElementById("corpoTabela");

    // Instanciamos o gráfico do ECharts no contêiner preparado
    const elementoGrafico = document.getElementById('graficoVelocimetro');
    const meuGrafico = echarts.init(elementoGrafico);
    
    // Deixamos o gráfico responsivo se a tela redimensionar
    window.addEventListener('resize', () => {
        meuGrafico.resize();
    });

    // Função engatilhada quando o usuário clica em "Calcular" ou pressiona Enter no form
    formulario.addEventListener("submit", async (evento) => {
        // Previne o recarregamento padrão da página ao enviar form
        evento.preventDefault();

        // Pegamos os valores digitados. Trocamos vírgula por ponto para o parseFloat entender.
        const alturaTexto = document.getElementById("altura").value.replace(',', '.');
        const pesoTexto = document.getElementById("peso").value.replace(',', '.');
        const altura = parseFloat(alturaTexto);
        const peso = parseFloat(pesoTexto);

        try {
            // Fazemos uma requisição HTTP (Fetch API) via método POST para o nosso backend C#
            const resposta = await fetch("/api/imc/calcular", {
                method: "POST",
                headers: {
                    // Avisamos a API que estamos enviando e queremos receber dados no formato JSON
                    "Content-Type": "application/json"
                },
                // Transformamos o objeto Javascript em um texto JSON para trafegar pela rede
                body: JSON.stringify({ altura: altura, peso: peso })
            });

            if (!resposta.ok) {
                alert("Erro ao calcular IMC. Verifique os valores inseridos.");
                return;
            }

            // Convertemos a resposta JSON de volta para objeto Javascript
            const dados = await resposta.json();

            // Mostramos a interface de resultados removendo a classe d-none (display: none do Bootstrap)
            recipienteResultado.classList.remove("d-none");

            // Atualizamos os textos de resultado, trocando ponto por vírgula no visual
            rotuloValorImc.innerText = dados.imc.toString().replace('.', ',');
            rotuloClassificacaoImc.innerText = dados.classificacao;

            // Renderizamos o Gráfico Gauge (Velocímetro) e a Tabela de classificações
            renderizarGrafico(dados.imc);
            renderizarTabela(dados.tabelaClassificacoes, dados.classificacao);

            // Rola a página para os resultados se tiver em mobile
            recipienteResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });

        } catch (erro) {
            console.error("Erro na comunicação com a API:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });

    /**
     * Função para configurar e desenhar o Velocímetro usando a biblioteca Apache ECharts.
     * Ela recebe o valor do IMC calculado pelo servidor.
     */
    function renderizarGrafico(valorImc) {
        // Como o gráfico fica dentro de uma div com "d-none" inicialmente, 
        // o ECharts não consegue calcular o tamanho correto no momento da inicialização.
        // O resize() força ele a ler as larguras corretas após a div ficar visível.
        meuGrafico.resize();

        const opcoes = {
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    center: ['50%', '75%'],
                    radius: '110%', // Aumentado um pouco mais para o gráfico ocupar melhor a div
                    // Limites visuais do IMC para o gráfico ficar visualmente balanceado (10 a 50)
                    min: 10,
                    max: 50, 
                    splitNumber: 4, // Divisões do gráfico
                    axisLine: {
                        lineStyle: {
                            width: 30, // Grossura da linha aumentada consideravelmente
                            // Definimos as cores das faixas com base nas proporções do arco de 10 a 50
                            // (18.5 - 10) / 40 = 0.2125
                            // (25.0 - 10) / 40 = 0.375
                            // (30.0 - 10) / 40 = 0.5
                            // (35.0 - 10) / 40 = 0.625
                            // (40.0 - 10) / 40 = 0.75
                            color: [
                                [0.2125, '#ffc107'], // Abaixo do peso
                                [0.375, '#28a745'],  // Normal
                                [0.5, '#fd7e14'],    // Sobrepeso
                                [0.625, '#dc3545'],  // Obesidade I
                                [0.75, '#c82333'],   // Obesidade II
                                [1, '#721c24']       // Obesidade III
                            ]
                        }
                    },
                    pointer: {
                        length: '75%', // Ponteiro um pouco mais comprido
                        width: 8,      // Ponteiro um pouco mais largo
                        itemStyle: {
                            color: 'auto'
                        }
                    },
                    axisTick: {
                        distance: -30,
                        length: 8,
                        lineStyle: { color: '#fff', width: 2 }
                    },
                    splitLine: {
                        distance: -30,
                        length: 30,
                        lineStyle: { color: '#fff', width: 4 }
                    },
                    axisLabel: {
                        color: 'inherit',
                        distance: 40, // Afastamos para não encostar na linha grossa
                        fontSize: 16, // Aumentado o tamanho dos números (10, 20, 30...)
                        fontWeight: 'bold'
                    },
                    title: {
                        offsetCenter: [0, '30%'], // Posição do texto "IMC"
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#6c757d'
                    },
                    detail: {
                        valueAnimation: true,
                        // Formatar o valor para usar vírgula e garantir 2 casas decimais
                        formatter: function (value) {
                            return value.toFixed(2).replace('.', ',');
                        },
                        color: 'inherit',
                        fontSize: 40, // Aumentado o número central do resultado
                        fontWeight: 'bold',
                        offsetCenter: [0, '65%']
                    },
                    data: [
                        {
                            value: valorImc,
                            name: 'IMC'
                        }
                    ]
                }
            ]
        };

        // Aplica a configuração no gráfico e desenha com animação
        meuGrafico.setOption(opcoes, true);
    }

    /**
     * Função para desenhar a tabela HTML de faixas de peso dinamicamente.
     * Ela pega o Array de faixas devolvido pelo backend C#.
     */
    function renderizarTabela(faixas, classificacaoAtual) {
        // Limpamos o conteúdo antigo da tabela
        corpoTabela.innerHTML = "";

        faixas.forEach(faixa => {
            // Criamos a lógica para exibir o texto (ex: "Menos de 60kg", "60kg - 80kg") formatado com vírgulas
            let textoPeso = "";
            if (faixa.pesoMinimo === null) {
                textoPeso = `Menos de ${faixa.pesoMaximo.toString().replace('.', ',')} kg`;
            } else if (faixa.pesoMaximo === null) {
                textoPeso = `Mais de ${faixa.pesoMinimo.toString().replace('.', ',')} kg`;
            } else {
                textoPeso = `Entre ${faixa.pesoMinimo.toString().replace('.', ',')} e ${faixa.pesoMaximo.toString().replace('.', ',')} kg`;
            }

            // Destacamos a linha se for a classificação atual do usuário
            const ehClassificacaoAtual = faixa.classificacao === classificacaoAtual;
            // Se for a classificação atual, aplicamos um fundo verde clarinho e uma borda esquerda em destaque
            const estiloDestaque = ehClassificacaoAtual ? "background-color: #f0fdf4; border-left: 4px solid var(--primary-color);" : "";

            // Injetamos a linha de HTML usando Template Strings (as crases ``)
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="${estiloDestaque}">
                    <span class="ponto-cor" style="background-color: ${faixa.cor}"></span>
                    ${faixa.classificacao} ${ehClassificacaoAtual ? "<strong class='text-primary ms-1'>(Você)</strong>" : ""}
                </td>
                <td style="${estiloDestaque}">
                    ${textoPeso}
                </td>
            `;
            corpoTabela.appendChild(tr);
        });
    }
});
