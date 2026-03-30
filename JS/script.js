
// VARIÁVEIS PRINCIPAIS


let disciplinas = JSON.parse(localStorage.getItem("disciplinas")) || []

const formDisciplina = document.getElementById("form-disciplina")
const container = document.getElementById("DisciplinasContainer")

const modalHoras = document.getElementById("modalHoras")
const modalEdicao = document.getElementById("modalEdicao")

const formHoras = document.getElementById("formHoras")
const formEdicao = document.getElementById("formEdicao")

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearsearch");

let disciplinaAtual = null

searchInput.addEventListener("input", function () {
    renderDisciplinas();
});

// Botão para limpar a busca
clearSearch.addEventListener("click", function () {

    searchInput.value = "";

    renderizarDisciplinas();

});
document.getElementById("clearsearch").addEventListener("click", function(){

    document.getElementById("searchInput").value = ""

    renderDisciplinas()

})

// SALVAR LOCALSTORAGE

function salvarDados(){
    localStorage.setItem("disciplinas", JSON.stringify(disciplinas))
}


// CADASTRAR DISCIPLINA
const areaSelect = document.getElementById("areaSelect")
const areaOutro = document.getElementById("areaOutro")
areaOutro.style.display = "none"

areaSelect.addEventListener("change", function(){

    if(areaSelect.value === "outros"){
        areaOutro.style.display = "block"
        areaOutro.setAttribute("required", "required")
    }else{
        areaOutro.style.display = "none"
        areaOutro.removeAttribute("required")
    }

})

formDisciplina.addEventListener("submit", function(e){

    e.preventDefault()

    const nome = document.getElementById("nome-disciplina").value
    const professor = document.getElementById("codigo-disciplina").value
    const carga = document.getElementById("carga-horaria").value
    let area = areaSelect.value

    if(area === "outros"){
        area = areaOutro.value.trim()

        if(area === ""){
            alert("Por favor, preencha a área de conhecimento.")
            return
        }
    }

    const novaDisciplina = {
        id: Date.now(),
        nome: nome,
        professor: professor,
        cargaHoraria: Number(carga),
        area: area,
        horasEstudadas: []
    }

    disciplinas.push(novaDisciplina)

    salvarDados()
    renderDisciplinas()

    formDisciplina.reset()

    areaOutro.style.display = "none"
    areaSelect.value = ""

})


// RENDERIZAR DISCIPLINAS


function renderDisciplinas(){

    const busca = document.getElementById("searchInput").value.toLowerCase()
    const disciplinasFiltradas = disciplinas.filter(d =>
    d.nome.toLowerCase().includes(busca) ||
    d.professor.toLowerCase().includes(busca)
)

    container.innerHTML = ""

    if(disciplinas.length === 0){
        container.innerHTML = `
        <div class="empty-state">
        <p>Nenhuma disciplina cadastrada</p>
        </div>`

        return
    }

    disciplinasFiltradas.forEach(d => {

        let totalHoras = d.horasEstudadas.reduce((acc,h)=>acc+h.horas,0)

        let progresso = ((totalHoras / d.cargaHoraria) * 100).toFixed(1)

        const card = document.createElement("div")

        card.classList.add("disciplina-card")

        card.innerHTML = `
        <h3>${d.nome}</h3>
        <p>Professor: ${d.professor}</p>
        <p>Carga Horária: ${d.cargaHoraria}h</p>
        <p>Horas estudadas: ${totalHoras}</p>
        <p>Progresso: ${progresso}%</p>

        <button class="btn-horas" onclick="abrirHoras(${d.id})">Registrar Horas</button>
        <button class="btn-edicao" onclick="abrirEdicao(${d.id})">Editar</button>
        <button class="btn-excluir" onclick="excluirDisciplina(${d.id})">Excluir</button>
        `

        container.appendChild(card)

    })

    atualizarStats()

}

// EXCLUIR DISCIPLINA

function excluirDisciplina(id){

    disciplinas = disciplinas.filter(d => d.id !== id)

    salvarDados()
    renderDisciplinas()
    atualizarStats()

}


// MODAL HORAS


function abrirHoras(id){

    disciplinaAtual = disciplinas.find(d => d.id === id)

    modalHoras.style.display = "block"

}

formHoras.addEventListener("submit", function(e){

    e.preventDefault()

    const horas = Number(document.getElementById("horasEstudadas").value)
    const data = document.getElementById("dataEstudo").value
    const obs = document.getElementById("observacao").value

    disciplinaAtual.horasEstudadas.push({
        horas: horas,
        data: data,
        obs: obs
    })

    salvarDados()
    renderDisciplinas()

    modalHoras.style.display = "none"

    formHoras.reset()

})


// MODAL EDIÇÃO


function abrirEdicao(id){

    disciplinaAtual = disciplinas.find(d => d.id === id)

    document.getElementById("nomeDisciplinaEdit").value = disciplinaAtual.nome
    document.getElementById("professorEdit").value = disciplinaAtual.professor
    document.getElementById("editCargaHoraria").value = disciplinaAtual.cargaHoraria

    const editArea = document.getElementById("editArea");
    const editAreaOutro = document.getElementById("editAreaOutro");

    // Se for uma das opções, seleciona, senão mostra campo texto
    if (["exatas","humanas","biologicas","tecnologia"].includes(disciplinaAtual.area)) {
        editArea.value = disciplinaAtual.area;
        editAreaOutro.style.display = "none";
        editAreaOutro.value = "";
    } else {
        editArea.value = "outros";
        editAreaOutro.style.display = "block";
        editAreaOutro.value = disciplinaAtual.area;
    }

    modalEdicao.style.display = "block"

}


// Lógica para mostrar/esconder campo texto no select do modal edição
const editArea = document.getElementById("editArea");
const editAreaOutro = document.getElementById("editAreaOutro");
editArea.addEventListener("change", function() {
    if(editArea.value === "outros") {
        editAreaOutro.style.display = "block";
        editAreaOutro.setAttribute("required", "required");
    } else {
        editAreaOutro.style.display = "none";
        editAreaOutro.removeAttribute("required");
    }
});

formEdicao.addEventListener("submit", function(e){
    e.preventDefault()
    disciplinaAtual.nome = document.getElementById("nomeDisciplinaEdit").value
    disciplinaAtual.professor = document.getElementById("professorEdit").value
    disciplinaAtual.cargaHoraria = Number(document.getElementById("editCargaHoraria").value)
    let area = editArea.value;
    if(area === "outros"){
        area = editAreaOutro.value.trim();
        if(area === ""){
            alert("Por favor, preencha a área de conhecimento.");
            return;
        }
    }
    disciplinaAtual.area = area;
    salvarDados()
    renderDisciplinas()
    modalEdicao.style.display = "none"
})


// FECHAR MODAIS


document.querySelectorAll(".modal-close").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        modalHoras.style.display = "none"
        modalEdicao.style.display = "none"
    })
})


// ESTATÍSTICAS


function atualizarStats(){

    document.getElementById("totalDisciplinas").textContent = disciplinas.length

    let totalHoras = 0
    let somaProgresso = 0

    disciplinas.forEach(d => {

        let horasDisciplina = d.horasEstudadas.reduce((acc,h)=>acc+h.horas,0)

        totalHoras += horasDisciplina

        let progresso = (horasDisciplina / d.cargaHoraria) * 100

        somaProgresso += progresso
    })

    document.getElementById("totalHorasEstudadas").textContent = totalHoras

    let progressoMedio = 0

    if(disciplinas.length > 0){
        progressoMedio = somaProgresso / disciplinas.length
    }

    document.getElementById("progressoMedio").textContent =
        progressoMedio.toFixed(1) + "%"

}

// INICIALIZAÇÃO


renderDisciplinas()