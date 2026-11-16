class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const listaDeProdutos = [];

let indiceEdicao = null;
let acaoPendente = null;

const CHAVE_STORAGE = "sistema_estoque_produtos";

const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");
const selectOrdenacao = document.getElementById("select-ordenacao");
const mensagemErro = document.getElementById("mensagem-erro");

const btnExportarCsv = document.getElementById("btn-exportar-csv");
const btnExportarJson = document.getElementById("btn-exportar-json");
const inputImportarJson = document.getElementById("input-importar-json");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const tituloModal = document.getElementById("titulo-modal");
const textoModal = document.getElementById("texto-modal");
const btnConfirmar = document.getElementById("btn-confirmar");
const btnCancelar = document.getElementById("btn-cancelar");

const modalBootstrap = document.getElementById("modal-bootstrap");
const btnBootstrap = document.getElementById("btn-bootstrap");
const btnFecharBootstrap = document.getElementById("btn-fechar-bootstrap");

const btnAdicionar = document.querySelector(".btn-primary");

formProduto.noValidate = true;

function mostrarMensagem(mensagem, tipo = "erro") {
    mensagemErro.textContent = mensagem;
    mensagemErro.className = "mensagem-inline " + tipo;
    mensagemErro.style.display = "block";
}

function limparMensagem() {
    mensagemErro.textContent = "";
    mensagemErro.style.display = "none";
}

function salvarNoLocalStorage() {
    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(listaDeProdutos)
    );
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) return;

    try {
        const produtosObjetos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosObjetos)) {
            throw new Error("Formato inválido");
        }

        listaDeProdutos.length = 0;

        produtosObjetos.forEach((prod) => {
            if (
                typeof prod.nome === "string" &&
                prod.nome.trim() !== "" &&
                Number.isFinite(Number(prod.preco)) &&
                Number(prod.preco) > 0 &&
                Number.isInteger(Number(prod.quantidade)) &&
                Number(prod.quantidade) > 0
            ) {
                const produto = new Produto(
                    prod.nome,
                    prod.preco,
                    prod.quantidade
                );

                listaDeProdutos.push(produto);
            }
        });

    } catch (erro) {
        console.error("Erro ao carregar os produtos:", erro);
        localStorage.removeItem(CHAVE_STORAGE);
    }
}

formProduto.addEventListener("submit", function(event) {
    event.preventDefault();

    limparMensagem();

    const nomeInput = document.getElementById("nome").value.trim();

    const precoInput = parseFloat(
        document.getElementById("preco").value
    );

    const quantidadeInput = parseInt(
        document.getElementById("quantidade").value
    );

    if (!nomeInput) {
        mostrarMensagem("Por favor, informe o nome do produto.");
        document.getElementById("nome").focus();
        return;
    }

    if (
        isNaN(precoInput) ||
        !Number.isFinite(precoInput) ||
        precoInput <= 0
    ) {
        mostrarMensagem("Informe um preço válido maior que zero.");
        document.getElementById("preco").focus();
        return;
    }

    if (
        isNaN(quantidadeInput) ||
        !Number.isInteger(quantidadeInput) ||
        quantidadeInput <= 0
    ) {
        mostrarMensagem("Informe uma quantidade válida maior que zero.");
        document.getElementById("quantidade").focus();
        return;
    }

    const novoProduto = new Produto(
        nomeInput,
        precoInput,
        quantidadeInput
    );

    if (indiceEdicao === null) {
        listaDeProdutos.push(novoProduto);
        mostrarMensagem("Produto cadastrado com sucesso!", "sucesso");
    } else {
        listaDeProdutos[indiceEdicao] = novoProduto;
        indiceEdicao = null;
        btnAdicionar.textContent = "Adicionar Produto";
        mostrarMensagem("Produto atualizado com sucesso!", "sucesso");
    }

    salvarNoLocalStorage();
    atualizarInterface();

    formProduto.reset();
});

campoBusca.addEventListener("input", function() {
    atualizarInterface();
});

selectOrdenacao.addEventListener("change", function() {
    atualizarInterface();
});

function obterProdutosProcessados() {
    const termoBusca = campoBusca.value.toLowerCase().trim();

    let itensFiltrados = listaDeProdutos
        .map((produto, index) => ({ produto, index }))
        .filter(item => item.produto.nome.toLowerCase().includes(termoBusca));

    const criterio = selectOrdenacao.value;
    let itensOrdenados = [...itensFiltrados];

    if (criterio === "menor-qtd") {
        itensOrdenados.sort((a, b) => a.produto.quantidade - b.produto.quantidade);
    } else if (criterio === "maior-preco") {
        itensOrdenados.sort((a, b) => b.produto.preco - a.produto.preco);
    } else if (criterio === "menor-preco") {
        itensOrdenados.sort((a, b) => a.produto.preco - b.produto.preco);
    } else if (criterio === "alfabetica") {
        itensOrdenados.sort((a, b) => a.produto.nome.localeCompare(b.produto.nome));
    }

    return itensOrdenados;
}

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];
    if (!produto) return;

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indiceEdicao = index;
    btnAdicionar.textContent = "Salvar Alterações";
    limparMensagem();

    document.getElementById("nome").focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function abrirModal(titulo, mensagem, acao) {
    tituloModal.textContent = titulo;
    textoModal.textContent = mensagem;
    acaoPendente = acao;
    modalConfirmacao.hidden = false;
    btnCancelar.focus();
}

function fecharModal() {
    modalConfirmacao.hidden = true;
    acaoPendente = null;
}

btnCancelar.addEventListener("click", function() {
    fecharModal();
});

btnConfirmar.addEventListener("click", function() {
    if (typeof acaoPendente === "function") {
        const acao = acaoPendente;
        fecharModal();
        acao();
    }
});

modalConfirmacao.addEventListener("click", function(event) {
    if (event.target === modalConfirmacao) {
        fecharModal();
    }
});

function removerProduto(index) {
    const produto = listaDeProdutos[index];
    if (!produto) return;

    abrirModal(
        "Excluir Produto",
        `Tem certeza que deseja excluir o produto "${produto.nome}"?`,
        function() {
            if (indiceEdicao === index) {
                indiceEdicao = null;
                btnAdicionar.textContent = "Adicionar Produto";
                formProduto.reset();
            } else if (indiceEdicao !== null && index < indiceEdicao) {
                indiceEdicao--;
            }

            listaDeProdutos.splice(index, 1);
            salvarNoLocalStorage();
            atualizarInterface();
            mostrarMensagem("Produto removido com sucesso!", "sucesso");
        }
    );
}

btnLimparTudo.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        mostrarMensagem("O estoque já está vazio!");
        return;
    }

    abrirModal(
        "Limpar Todo o Estoque",
        "Tem certeza que deseja excluir TODOS los produtos? Essa ação não poderá ser desfeita.",
        function() {
            listaDeProdutos.length = 0;
            indiceEdicao = null;
            localStorage.removeItem(CHAVE_STORAGE);
            formProduto.reset();
            btnAdicionar.textContent = "Adicionar Produto";
            atualizarInterface();
            mostrarMensagem("Todos os produtos foram removidos!", "sucesso");
        }
    );
});

btnExportarCsv.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        mostrarMensagem("Não há produtos para exportar.");
        return;
    }

    let conteudoCsv = "Nome;Preco;Quantidade;Subtotal\n";
    listaDeProdutos.forEach(p => {
        conteudoCsv += `${p.nome};${p.preco.toFixed(2)};${p.quantidade};${p.calcularSubtotal().toFixed(2)}\n`;
    });

    const blob = new Blob([conteudoCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "estoque.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

btnExportarJson.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        mostrarMensagem("Não há dados para gerar o backup.");
        return;
    }

    const dadosJson = JSON.stringify(listaDeProdutos, null, 2);
    const blob = new Blob([dadosJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "backup_estoque.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

inputImportarJson.addEventListener("change", function(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            const dadosRestaurados = JSON.parse(e.target.result);
            if (!Array.isArray(dadosRestaurados)) {
                throw new Error("Arquivo JSON inválido.");
            }

            listaDeProdutos.length = 0;
            dadosRestaurados.forEach(prod => {
                if (prod.nome && prod.preco && prod.quantidade) {
                    listaDeProdutos.push(new Produto(prod.nome, prod.preco, prod.quantidade));
                }
            });

            salvarNoLocalStorage();
            atualizarInterface();
            mostrarMensagem("Backup restaurado com sucesso!", "sucesso");
        } catch (erro) {
            mostrarMensagem("Erro ao ler o arquivo JSON de backup.");
        }
        inputImportarJson.value = ""; 
    };
    leitor.readAsText(arquivo);
});

btnBootstrap.addEventListener("click", function() {
    modalBootstrap.hidden = false;
    btnFecharBootstrap.focus();
});

function fecharModalBootstrap() {
    modalBootstrap.hidden = true;
}

btnFecharBootstrap.addEventListener("click", function() {
    fecharModalBootstrap();
});

modalBootstrap.addEventListener("click", function(event) {
    if (event.target === modalBootstrap) {
        fecharModalBootstrap();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        if (!modalConfirmacao.hidden) {
            fecharModal();
        }
        if (!modalBootstrap.hidden) {
            fecharModalBootstrap();
        }
    }
});

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    const produtosVisiveis = obterProdutosProcessados();

    if (produtosVisiveis.length === 0) {
        const linhaVazia = document.createElement("tr");
        const colunaVazia = document.createElement("td");
        colunaVazia.colSpan = 5;
        colunaVazia.textContent = "Nenhum produto encontrado.";
        linhaVazia.appendChild(colunaVazia);
        tabelaBody.appendChild(linhaVazia);
        return;
    }

    produtosVisiveis.forEach((item) => {
        const produto = item.produto;
        const indexReal = item.index;

        const linha = document.createElement("tr");

        if (produto.quantidade <= 3) {
            linha.classList.add("estoque-critico");
        }

        const colunaNome = document.createElement("td");
        colunaNome.textContent = produto.nome;
        
        if (produto.quantidade <= 3) {
            const badge = document.createElement("span");
            badge.className = "badge-alerta";
            badge.textContent = "Repor";
            colunaNome.appendChild(badge);
        }

        const colunaPreco = document.createElement("td");
        colunaPreco.textContent = `R$ ${produto.preco.toFixed(2)}`;

        const colunaQuantidade = document.createElement("td");
        colunaQuantidade.textContent = produto.quantidade;

        const colunaSubtotal = document.createElement("td");
        colunaSubtotal.textContent = `R$ ${produto.calcularSubtotal().toFixed(2)}`;

        const colunaAcoes = document.createElement("td");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.className = "btn-editar";
        btnEditar.type = "button";
        btnEditar.addEventListener("click", function() {
            prepararEdicao(indexReal);
        });

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.className = "btn-remover";
        btnRemover.type = "button";
        btnRemover.addEventListener("click", function() {
            removerProduto(indexReal);
        });

        colunaAcoes.appendChild(btnEditar);
        colunaAcoes.appendChild(btnRemover);

        linha.appendChild(colunaNome);
        linha.appendChild(colunaPreco);
        linha.appendChild(colunaQuantidade);
        linha.appendChild(colunaSubtotal);
        linha.appendChild(colunaAcoes);

        tabelaBody.appendChild(linha);
    });
}

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

carregarDoLocalStorage();
atualizarInterface();