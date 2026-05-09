// frontend/assets/js/dashboard.js

const usuario = JSON.parse(localStorage.getItem("usuario"));

const bienvenida = document.getElementById("bienvenida");
const logoutBtn = document.getElementById("logoutBtn");
const nombreUsuario = document.getElementById("nombreUsuario");

if (usuario) {
    bienvenida.textContent = `¡Bienvenido, ${usuario.nombre}!`;
    nombreUsuario.textContent = usuario.nombre;
} else {
    window.location.href = "login.html";
}

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
});

/* MODAL */

const modal = document.getElementById("modalVoluntarios");
const btnVoluntarios = document.getElementById("btnVoluntarios");
const cerrarModal = document.getElementById("cerrarModal");
const resultado = document.getElementById("resultadoVoluntarios");

if (btnVoluntarios) {
    btnVoluntarios.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
    });
}

cerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});


/* FUNCIONES */

async function verVoluntarios() {
    try {
        const response = await fetch("http://localhost:3000/voluntarios");
        const data = await response.json();

        let html = "<h3>Lista de Voluntarios</h3>";

        data.forEach(v => {
            html += `
                <p>
                    <strong>ID:</strong> ${v.id_voluntario}
                    |
                    <strong>Nombre:</strong> ${v.nombre}
                    |
                    <strong>Teléfono:</strong> ${v.telefono}
                </p>
            `;
        });

        resultado.innerHTML = html;

    } catch (error) {
        resultado.innerHTML = "Error al cargar voluntarios";
    }
}

async function agregarVoluntario() {
    const nombre = prompt("Ingrese nombre:");
    const telefono = prompt("Ingrese teléfono:");
    const direccion = prompt("Ingrese dirección:");

    if (!nombre || !telefono || !direccion) {
        alert("Complete todos los campos");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/voluntarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                telefono,
                direccion,
                id_usuario: 1
            })
        });

        const data = await response.json();
        alert(data.message);
        verVoluntarios();

    } catch (error) {
        alert("Error al agregar voluntario");
    }
}

async function eliminarVoluntario() {
    const id = prompt("Ingrese ID a eliminar:");

    if (!id) return;

    try {
        const response = await fetch(`http://localhost:3000/voluntarios/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();
        alert(data.message);
        verVoluntarios();

    } catch (error) {
        alert("Error al eliminar");
    }
}

function verEliminados() {
    resultado.innerHTML = `
        <h3>Voluntarios Eliminados</h3>
        <p>Aquí luego conectaremos historial de eliminados.</p>
    `;
}

/* =========================
   MODAL CAMPAÑAS
========================= */

const modalCampanas = document.getElementById("modalCampanas");
const btnCampanas = document.getElementById("btnCampanas");
const cerrarModalCampanas = document.getElementById("cerrarModalCampanas");
const resultadoCampanas = document.getElementById("resultadoCampanas");

if (btnCampanas) {
    btnCampanas.addEventListener("click", (e) => {
        e.preventDefault();
        modalCampanas.style.display = "flex";
    });
}

cerrarModalCampanas.addEventListener("click", () => {
    modalCampanas.style.display = "none";
});

/*funciones -- ver campañas*/
async function verCampanas() {
    try {
        const response = await fetch("http://localhost:3000/campanas");
        const data = await response.json();

        let html = "<h3>Lista de Campañas</h3>";

        data.forEach(c => {
            html += `
                <p>
                    <strong>ID:</strong> ${c.id_campaña} |
                    <strong>Nombre:</strong> ${c.nombre} |
                    <strong>Estado:</strong> ${c.estado}
                </p>
            `;
        });

        resultadoCampanas.innerHTML = html;

    } catch (error) {
        resultadoCampanas.innerHTML = "Error al cargar campañas";
    }
}

/*crear campaña*/
async function crearCampana() {

    const nombre = prompt("Nombre:");
    const descripcion = prompt("Descripción:");
    const fecha_inicio = prompt("Fecha inicio (YYYY-MM-DD):");
    const fecha_fin = prompt("Fecha fin (YYYY-MM-DD):");

    if (!nombre || !fecha_inicio) {
        alert("Campos obligatorios faltantes");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/campanas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                descripcion,
                fecha_inicio,
                fecha_fin,
                responsable: "Admin"
            })
        });

        const data = await response.json();

        alert(data.message);
        verCampanas();

    } catch (error) {
        alert("Error al crear campaña");
    }
}

/*eliminar campaña*/
async function eliminarCampana() {

    const id = prompt("ID de campaña a eliminar:");

    if (!id) return;

    try {
        const response = await fetch(`http://localhost:3000/campanas/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        alert(data.message);
        verCampanas();

    } catch (error) {
        alert("Error al eliminar campaña");
    }
}

/* ===== MODAL ACTIVIDADES ===== */

const modalAct = document.getElementById("modalActividades");
const btnAct = document.getElementById("btnActividades");
const cerrarAct = document.getElementById("cerrarModalActividades");
const resultadoAct = document.getElementById("resultadoActividades");

if (btnAct) {
    btnAct.addEventListener("click", (e) => {
        e.preventDefault();
        modalAct.style.display = "flex";
    });
}

cerrarAct.addEventListener("click", () => {
    modalAct.style.display = "none";
});

async function verActividades() {
    const res = await fetch("http://localhost:3000/actividades");
    const data = await res.json();

    let html = "<h3>Actividades</h3>";

    data.forEach(a => {
        html += `
            <p>
                ${a.nombre} | ${a.fecha} | Campaña: ${a.campaña}
            </p>
        `;
    });

    resultadoAct.innerHTML = html;
}

async function crearActividad() {
    const nombre = prompt("Nombre:");
    const fecha = prompt("Fecha (YYYY-MM-DD):");
    const id_campaña = prompt("ID campaña:");

    await fetch("http://localhost:3000/actividades", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, fecha, id_campaña })
    });

    verActividades();
}

async function eliminarActividad() {
    const id = prompt("ID actividad:");

    await fetch(`http://localhost:3000/actividades/${id}`, {
        method: "DELETE"
    });

    verActividades();
}

/* ===== MODAL INSCRIPCIONES ===== */

const modalIns = document.getElementById("modalInscripciones");
const btnIns = document.getElementById("btnInscripciones");
const cerrarIns = document.getElementById("cerrarModalInscripciones");
const resultadoIns = document.getElementById("resultadoInscripciones");

if (btnIns) {
    btnIns.addEventListener("click", (e) => {
        e.preventDefault();
        modalIns.style.display = "flex";
    });
}

cerrarIns.addEventListener("click", () => {
    modalIns.style.display = "none";
});

async function verInscripciones() {
    const res = await fetch("http://localhost:3000/inscripciones");
    const data = await res.json();

    let html = "<h3>Inscripciones</h3>";

    data.forEach(i => {
        html += `
            <p>
                ${i.voluntario} → ${i.actividad} → ${i.campaña}
            </p>
        `;
    });

    resultadoIns.innerHTML = html;
}

async function crearInscripcion() {
    const id_voluntario = prompt("ID voluntario:");
    const id_actividad = prompt("ID actividad:");

    await fetch("http://localhost:3000/inscripciones", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_voluntario, id_actividad })
    });

    verInscripciones();
}

async function eliminarInscripcion() {
    const id = prompt("ID inscripción:");

    await fetch(`http://localhost:3000/inscripciones/${id}`, {
        method: "DELETE"
    });

    verInscripciones();
}

