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

const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome").value.trim();
    const precoInput = parseFloat(document.getElementById("preco").value);
    const quantidadeInput = parseInt(document.getElementById("quantidade").value);

    if (!nomeInput) {
        alert("Por favor, informe um nome válido para o produto.");
        return;
    }

    if (isNaN(precoInput) || precoInput <= 0 || isNaN(quantidadeInput) || quantidadeInput <= 0) {
        alert("O preço e a quantidade devem ser valores numéricos maiores que zero.");
        return;
    }

    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);

    if (indiceEdicao === null) {
        listaDeProdutos.push(novoProduto);
    } else {
        listaDeProdutos[indiceEdicao] = novoProduto;
        indiceEdicao = null;
        document.querySelector(".btn-primary").textContent = "Adicionar Produto";
    }

    salvarNoLocalStorage();
    atualizarInterface();
    formProduto.reset();
});

btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);
        indiceEdicao = null;
        document.querySelector(".btn-primary").textContent = "Adicionar Produto";
        formProduto.reset();
        atualizarInterface();
    }
});

campoBusca.addEventListener("input", function () {
    atualizarInterface();
});

function obterProdutosFiltrados() {
    const termoBusca = campoBusca.value.toLowerCase().trim();
    return listaDeProdutos.filter(produto => 
        produto.nome.toLowerCase().includes(termoBusca)
    );
}

function prepararEdicao(index) {
    const produtoRealIndex = listaDeProdutos.indexOf(obterProdutosFiltrados()[index]);
    const produto = listaDeProdutos[produtoRealIndex];

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indiceEdicao = produtoRealIndex;
    document.querySelector(".btn-primary").textContent = "Salvar Alterações";
}

function removerProduto(index) {
    const produtoRealIndex = listaDeProdutos.indexOf(obterProdutosFiltrados()[index]);

    if (indiceEdicao === produtoRealIndex) {
        indiceEdicao = null;
        document.querySelector(".btn-primary").textContent = "Adicionar Produto";
        formProduto.reset();
    } else if (indiceEdicao !== null && produtoRealIndex < indiceEdicao) {
        indiceEdicao--;
    }

    listaDeProdutos.splice(produtoRealIndex, 1);
    salvarNoLocalStorage();
    atualizarInterface();
}

function atualizarTotalEstoque() {
    const produtosVisiveis = obterProdutosFiltrados();
    const total = produtosVisiveis.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    const produtosVisiveis = obterProdutosFiltrados();

    if (produtosVisiveis.length === 0) {
        const linhaVazia = document.createElement("tr");
        linhaVazia.innerHTML = `<td colspan="5">Nenhum produto encontrado.</td>`;
        tabelaBody.appendChild(linhaVazia);
        return;
    }

    produtosVisiveis.forEach((produto, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const btnEditar = linha.querySelector(".btn-editar");
        const btnRemover = linha.querySelector(".btn-remover");

        btnEditar.addEventListener("click", () => prepararEdicao(index));
        btnRemover.addEventListener("click", () => removerProduto(index));

        tabelaBody.appendChild(linha);
    });
}

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

carregarDoLocalStorage();
atualizarInterface();