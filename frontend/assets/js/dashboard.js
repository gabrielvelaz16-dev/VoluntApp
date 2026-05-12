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

const dynamicContent =
    document.getElementById("dynamicContent");
    let usuarioEditando = null;

const btnUsuarios =
    document.getElementById("btnUsuarios");

if (btnUsuarios) {

    btnUsuarios.addEventListener("click", (e) => {

        e.preventDefault();

        cargarModuloUsuarios();

    });

}


/* FUNCIONES */

async function cargarModuloUsuarios() {

    try {

        const response =
            await fetch("http://localhost:3000/usuarios");

        const data = await response.json();

        let filas = "";

        data.forEach(v => {

            filas += `

                <tr>

                    <td>
                        ${v.nombre} ${v.apellido || ""}
                    </td>

                    <td>
                        ${v.username}
                    </td>

                    <td>
                        ${v.rol}
                    </td>

                    <td>
                        ${v.estado}
                    </td>

                    <td>

                        <button
                            class="btn-editar"
                            onclick="editarUsuario(${v.id_usuario})"
                        >
                            Editar
                        </button>

                        <button
                            class="btn-estado"
                            onclick="cambiarEstado(${v.id_usuario}, '${v.estado}')"
                        >

                            ${v.estado === 'activo'
                                ? 'Desactivar'
                                : 'Activar'}

                        </button>

                    </td>

                </tr>

            `;

        });

        dynamicContent.innerHTML = `

            <div class="usuarios-module">

                <div class="module-header">

                    <h2>
                        Gestión de Usuarios
                    </h2>

                    <button
                        class="btn-add"
                        onclick="abrirModalUsuario()"
                    >
                        + Nuevo Usuario
                    </button>
                    

                </div>

                <div class="filters-container">

                    <input
                        type="text"
                        id="buscarUsuario"
                        placeholder="Buscar usuario..."
                    >

                    <select id="filtroEstado">

                        <option value="todos">
                            Todos los estados
                        </option>

                        <option value="activo">
                            Activos
                        </option>

                        <option value="inactivo">
                            Inactivos
                        </option>

                    </select>

                    <select id="filtroRol">

                        <option value="todos">
                            Todos los roles
                        </option>

                        <option value="admin">
                            Admin
                        </option>

                        <option value="coordinador">
                            Coordinador
                        </option>

                        <option value="voluntario">
                            Voluntario
                        </option>

                    </select>

                </div>

                <table class="usuarios-table">

                    <thead>

                        <tr>

                            <th>Nombre</th>
                            <th>Username</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${filas}

                    </tbody>

                </table>

            </div>

        `;

      const buscarUsuario =
     document.getElementById("buscarUsuario");

     const filtroEstado =
     document.getElementById("filtroEstado");

     const filtroRol =
     document.getElementById("filtroRol");

     buscarUsuario.addEventListener(
       "input",
        aplicarFiltros
        );

       filtroEstado.addEventListener(
       "change",
         aplicarFiltros
          );

         filtroRol.addEventListener(
          "change",
           aplicarFiltros
           );

    } catch (error) {

        console.error(error);

        dynamicContent.innerHTML = `
            <p>Error cargando usuarios</p>
        `;

    }

}

async function cambiarEstado(id, estadoActual) {

    const nuevoEstado =
        estadoActual === 'activo'
        ? 'inactivo'
        : 'activo';

    try {

        await fetch(

            `http://localhost:3000/usuarios/${id}/estado`,

            {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    estado: nuevoEstado
                })

            }

        );

        cargarModuloUsuarios();

    } catch (error) {

        console.error(error);

        alert('Error cambiando estado');

    }

}



function aplicarFiltros() {

    const texto =
        document.getElementById("buscarUsuario")
        .value
        .toLowerCase();

    const estado =
        document.getElementById("filtroEstado")
        .value
        .toLowerCase()
        .trim();

    const rol =
        document.getElementById("filtroRol")
        .value
        .toLowerCase()
        .trim();

    const filas =
        document.querySelectorAll(
            ".usuarios-table tbody tr"
        );

    filas.forEach(fila => {

        const nombre =
            fila.children[0]
            .textContent
            .toLowerCase();

       const rolFila =
            fila.children[2]
            .textContent
            .toLowerCase()
            .trim();

        const estadoFila =
            fila.children[3]
            .textContent
            .toLowerCase()
            .trim();

        const coincideTexto =
            nombre.includes(texto);

        const coincideEstado =
            estado === "todos" ||
            estadoFila === estado;

        const coincideRol =
            rol === "todos" ||
            rolFila === rol;

        if (
            coincideTexto &&
            coincideEstado &&
            coincideRol
        ) {

            fila.style.display = "";

        } else {

            fila.style.display = "none";

        }

    });

}

cargarModuloUsuarios();


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

function abrirModalUsuario() {

    document
        .getElementById("modalUsuario")
        .classList
        .remove("hidden");

}

async function editarUsuario(id) {

    try {

        const response =
            await fetch(
                "http://localhost:3000/usuarios"
            );

        const usuarios =
            await response.json();

        const usuario =
            usuarios.find(
                u => u.id_usuario === id
            );

        if (!usuario) return;

        usuarioEditando = id;

        document.getElementById(
            "nuevoNombre"
        ).value = usuario.nombre;

        document.getElementById(
            "nuevoApellido"
        ).value = usuario.apellido || "";

        document.getElementById(
            "nuevoUsername"
        ).value = usuario.username;

        document.getElementById(
            "nuevoEmail"
        ).value = usuario.email || "";

        document.getElementById(
            "nuevoPassword"
        ).value = "";

        document.getElementById(
            "nuevoRol"
        ).value = usuario.rol;

        abrirModalUsuario();

    } catch (error) {

        console.error(error);

    }

}

function cerrarModalUsuario() {

    document
        .getElementById("modalUsuario")
        .classList
        .add("hidden");

}

const formNuevoUsuario =
    document.getElementById(
        "formNuevoUsuario"
    );

formNuevoUsuario.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const nuevoUsuario = {

            nombre:
                document.getElementById(
                    "nuevoNombre"
                ).value,

            apellido:
                document.getElementById(
                    "nuevoApellido"
                ).value,

            username:
                document.getElementById(
                    "nuevoUsername"
                ).value,

            email:
                document.getElementById(
                    "nuevoEmail"
                ).value,

            password:
                document.getElementById(
                    "nuevoPassword"
                ).value,

            rol:
                document.getElementById(
                    "nuevoRol"
                ).value

        };

        try {

            const url = usuarioEditando

                ? `http://localhost:3000/usuarios/${usuarioEditando}`

                : "http://localhost:3000/usuarios";

            const method = usuarioEditando

                ? "PUT"

                : "POST";

            const response = await fetch(

                url,

                {

                    method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        nuevoUsuario
                    )

                }

            );

            const data =
                await response.json();

            if (response.ok) {

                alert(
                    "Usuario creado correctamente"
                );

                cerrarModalUsuario();

                formNuevoUsuario.reset();

                usuarioEditando = null;

                cargarModuloUsuarios();

            } else {

                alert(
                    data.message
                );

            }

        } catch (error) {

            console.error(error);

            alert(
                "Error creando usuario"
            );

        }

    }
);

