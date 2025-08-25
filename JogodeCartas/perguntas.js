// perguntas.js — perguntas sobre programação: 10 Fácil, 10 Médio, 10 Difícil
window.perguntas = {
  facil: [
    { pergunta: "O que significa HTML?", respostaCorreta: "HyperText Markup Language", respostasFalsas: ["HighText Machine Language", "Hyperlinks and Text Markup"] },
    { pergunta: "Qual linguagem é primariamente usada para estilizar páginas web?", respostaCorreta: "CSS", respostasFalsas: ["HTML", "Python"] },
    { pergunta: "Qual tag HTML representa um link?", respostaCorreta: "<a>", respostasFalsas: ["<link>", "<href>"] },
    { pergunta: "Como se comenta em JavaScript (uma linha)?", respostaCorreta: "// comentário", respostasFalsas: ["/* comentário */", "# comentário"] },
    { pergunta: "Qual é o operador para atribuição em JavaScript?", respostaCorreta: "=", respostasFalsas: ["==", "==="] },
    { pergunta: "Qual linguagem roda no navegador sem plugins?", respostaCorreta: "JavaScript", respostasFalsas: ["Java", "C#"] },
    { pergunta: "Qual é a extensão comum para arquivos CSS?", respostaCorreta: ".css", respostasFalsas: [".style", ".html"] },
    { pergunta: "Qual comando cria um repositório Git local?", respostaCorreta: "git init", respostasFalsas: ["git start", "git create"] },
    { pergunta: "Qual elemento HTML exibe texto maior/mais importante?", respostaCorreta: "<h1>", respostasFalsas: ["<p>", "<strong>"] },
    { pergunta: "Qual das opções é um tipo primitivo em JavaScript?", respostaCorreta: "String", respostasFalsas: ["Object", "Array"] }
  ],

  medio: [
    { pergunta: "O que faz o método array.map() em JavaScript?", respostaCorreta: "Retorna um novo array com o resultado da função aplicada a cada item", respostasFalsas: ["Modifica o array original", "Remove itens duplicados"] },
    { pergunta: "O que é um 'closure' em JavaScript?", respostaCorreta: "Uma função que lembra o escopo onde foi criada", respostasFalsas: ["Uma função anônima somente", "Um tipo de callback assíncrono"] },
    { pergunta: "Qual comando instala pacotes via npm?", respostaCorreta: "npm install", respostasFalsas: ["npm get", "npm add"] },
    { pergunta: "Em CSS, qual propriedade controla o espaçamento entre linhas?", respostaCorreta: "line-height", respostasFalsas: ["letter-spacing", "word-spacing"] },
    { pergunta: "O que faz 'HTTP'?", respostaCorreta: "Protocolo de transferência de hipertexto", respostasFalsas: ["Linguagem de programação", "Banco de dados"] },
    { pergunta: "Qual termo descreve comunicação entre front-end e servidor?", respostaCorreta: "API (requisições)", respostasFalsas: ["DOM", "CSS Grid"] },
    { pergunta: "Em SQL, qual comando remove dados de uma tabela?", respostaCorreta: "DELETE", respostasFalsas: ["DROP", "REMOVE"] },
    { pergunta: "O que é versionamento de código?", respostaCorreta: "Manter histórico de alterações do código", respostasFalsas: ["Compactar arquivos", "Enviar para produção"] },
    { pergunta: "O que significa 'responsive design'?", respostaCorreta: "Design que se adapta a diferentes tamanhos de tela", respostasFalsas: ["Design apenas para mobile", "Design sem imagens"] },
    { pergunta: "Qual método transforma JSON em objeto JS?", respostaCorreta: "JSON.parse()", respostasFalsas: ["JSON.stringify()", "Object.fromJSON()"] }
  ],

  dificil: [
    { pergunta: "O que é programação assíncrona?", respostaCorreta: "Execução de tarefas sem bloquear o fluxo principal", respostasFalsas: ["Código que roda somente no servidor", "Código que não usa funções"] },
    { pergunta: "Em JS, o que faz 'await'?", respostaCorreta: "Pausa execução até a Promise ser resolvida", respostasFalsas: ["Transforma função em promise", "Executa em paralelo"] },
    { pergunta: "Qual padrão ajuda na separação de responsabilidades em apps grandes?", respostaCorreta: "MVC (Model-View-Controller)", respostasFalsas: ["CSS-only", "Single File Pattern"] },
    { pergunta: "O que é 'hoisting' em JavaScript?", respostaCorreta: "Elevação de declarações para o topo do escopo", respostasFalsas: ["Carregamento tardio de módulos", "Compilação antecipada"] },
    { pergunta: "O que é um 'Promise' em JS?", respostaCorreta: "Objeto que representa resultado futuro de operação assíncrona", respostasFalsas: ["Função síncrona", "Tipo de dado primitivo"] },
    { pergunta: "Qual dos seguintes melhora performance em páginas web?", respostaCorreta: "Minificação e cache", respostasFalsas: ["Multiplicar imagens", "Usar muitos <br> tags"] },
    { pergunta: "O que significa 'ACID' em bancos de dados?", respostaCorreta: "Atomicidade, Consistência, Isolamento, Durabilidade", respostasFalsas: ["Autenticação, Criptografia, Integridade, Disponibilidade", "Agilidade, Consistência, Integridade, Disponibilidade"] },
    { pergunta: "O que é 'debounce' em JavaScript?", respostaCorreta: "Controle de frequência para execução de função", respostasFalsas: ["Executar função imediatamente várias vezes", "Transformar função em evento"] },
    { pergunta: "Em redes, o que é REST?", respostaCorreta: "Estilo arquitetural para APIs usando HTTP", respostasFalsas: ["Protocolo de transporte TCP", "Banco de dados não relacional"] },
    { pergunta: "O que é 'CORS'?", respostaCorreta: "Política que controla requisições entre origens diferentes", respostasFalsas: ["Tipo de servidor web", "Linguagem de template"] }
  ]
};
