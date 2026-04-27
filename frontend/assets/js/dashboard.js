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