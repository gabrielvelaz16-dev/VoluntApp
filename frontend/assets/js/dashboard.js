// frontend/assets/js/dashboard.js

const usuario =
    JSON.parse(localStorage.getItem("usuario"));

const rol = usuario?.rol;

if (usuario.rol !== "admin") {

    document.querySelector(
        ".notification-area"
    ).style.display = "none";

}


// =========================
// ELEMENTOS GENERALES
// =========================

const bienvenida =
    document.getElementById("bienvenida");

const logoutBtn =
    document.getElementById("logoutBtn");

const nombreUsuario =
    document.getElementById("nombreUsuario");

const rolUsuario =
    document.getElementById("rolUsuario");

const dynamicContent =
    document.getElementById("dynamicContent");

const btnNotificaciones =
    document.getElementById(
        "btnNotificaciones"
    );

const contadorNotificaciones =
    document.getElementById(
        "contadorNotificaciones"
    );

const panelNotificaciones =
    document.getElementById(
        "panelNotificaciones"
    );

const listaNotificaciones =
    document.getElementById(
        "listaNotificaciones"
    );

function activarMenu(idBoton) {

    const menus =
        document.querySelectorAll(
            ".sidebar-menu a"
        );

    menus.forEach(menu => {

        menu.classList.remove("active");

    });

    const botonActivo =
        document.getElementById(idBoton);

    if (botonActivo) {

        botonActivo.classList.add("active");

    }

}

let usuarioEditando = null;

let campanaEditando = null;

let responsablesCampana = [];


// =========================
// VALIDAR LOGIN
// =========================

if (usuario) {

    // voluntario → dashboard voluntario

    if (rol === "voluntario") {

        window.location.href =
            "dashboard_voluntario.html";

    }

    bienvenida.textContent =
        `¡Bienvenido, ${usuario.nombre}!`;

    nombreUsuario.textContent =
        usuario.nombre;

    rolUsuario.textContent =
    usuario.rol.charAt(0).toUpperCase() +
    usuario.rol.slice(1);


} else {

    window.location.href =
        "login.html";

}

// =========================
// inicio ESTADISTICAS DASHBOARD
// =========================

async function cargarEstadisticas() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/dashboard/stats"
            );

        const data =
            await response.json();

        document.getElementById(
            "totalVoluntarios"
        ).textContent =
            data.voluntarios;

        document.getElementById(
            "totalCampanas"
        ).textContent =
            data.campanas;

        document.getElementById(
            "totalActividades"
        ).textContent =
            data.actividades;

        document.getElementById(
            "totalInscripciones"
        ).textContent =
            data.inscripciones;

    } catch (error) {

        console.error(error);

    }


}

cargarEstadisticas();


// =========================
// LOGOUT
// =========================

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("usuario");

    window.location.href =
        "login.html";

});


// =========================
// BOTONES SIDEBAR
// =========================

const btnUsuarios =
    document.getElementById("btnUsuarios");

const btnInicio =
    document.getElementById("btnInicio");

if (btnInicio) { 

    btnInicio.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            activarMenu("btnInicio");

            mostrarInicio();

        }
    );

}

const btnCampanas =
    document.getElementById("btnCampanas");

const btnActividades =
    document.getElementById("btnActividades");

const btnInscripciones =
    document.getElementById("btnInscripciones");

const btnConfiguracion =
    document.getElementById("btnConfiguracion");

const btnComentarios =
    document.getElementById("btnComentarios");

if (btnConfiguracion) {

    btnConfiguracion.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            activarMenu(
                "btnConfiguracion"
            );

            mostrarConfiguracion();

        }
    );

}


// =========================
// PERMISOS POR ROL
// =========================

if (rol === "coordinador") {

    if (btnConfiguracion) {

        btnConfiguracion.style.display =
            "none";

    }

}

if (rol === "voluntario") {

    if (btnUsuarios) {

        btnUsuarios.style.display =
            "none";

    }

    if (btnCampanas) {

        btnCampanas.addEventListener(
            "click",
            (e) => {

                e.preventDefault();

                activarMenu("btnCampanas");

                cargarModuloCampanas();

            }
        );

    }

    if (btnConfiguracion) {

        btnConfiguracion.style.display =
            "none";

    }

    if (btnInscripciones) {

        btnInscripciones.style.display =
            "none";

    }

}


// =========================
// EVENTOS BOTONES
// =========================

if (btnUsuarios) {

    btnUsuarios.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            activarMenu("btnUsuarios");

            cargarModuloUsuarios();

        }
    );

}


if (btnCampanas) {

    btnCampanas.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            activarMenu("btnCampanas");

            cargarModuloCampanas();

        }
    );

}


if (btnActividades) {

    btnActividades.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            activarMenu("btnActividades");

            cargarModuloActividades();

        }
    );

}

if (btnInscripciones) {

    btnInscripciones.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            activarMenu("btnInscripciones");

            cargarModuloInscripciones();

        }
    );

}

if (btnComentarios) {

    btnComentarios.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            activarMenu(
                "btnComentarios"
            );

            mostrarComentarios();

        }
    );

}


// =========================
// MODULO USUARIOS
// =========================

async function cargarModuloUsuarios() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/usuarios"
            );

        const data =
            await response.json();

        let filas = "";

        data.forEach(v => {

            filas += `

                <tr>

                    <td>
                        ${v.nombre}
                        ${v.apellido || ""}
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

                        ${

                            rol === "admin"

                            ||

                            (
                                rol === "coordinador"
                                &&
                                v.rol === "voluntario"
                            )

                            ?

                            `

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

                            `

                            :

                            `<span>No permitido</span>`

                        }

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
            document.getElementById(
                "buscarUsuario"
            );

        const filtroEstado =
            document.getElementById(
                "filtroEstado"
            );

        const filtroRol =
            document.getElementById(
                "filtroRol"
            );

            if (buscarUsuario) {

                buscarUsuario.addEventListener(
                    "input",
                    aplicarFiltros
                );

            }

            if (filtroEstado) {

                filtroEstado.addEventListener(
                    "change",
                    aplicarFiltros
                );

            }

            if (filtroRol) {

                filtroRol.addEventListener(
                    "change",
                    aplicarFiltros
                );

            }

    } catch (error) {

        console.error(error);

        dynamicContent.innerHTML =
            `<p>Error cargando usuarios</p>`;

    }

}


// =========================
// CAMBIAR ESTADO
// =========================

async function cambiarEstado(
    id,
    estadoActual
) {

    const nuevoEstado =

        estadoActual === "activo"

        ? "inactivo"

        : "activo";

    try {

        await fetch(

            `http://localhost:3000/usuarios/${id}/estado`,

            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    estado: nuevoEstado

                })

            }

        );

        cargarModuloUsuarios();

    } catch (error) {

        console.error(error);

        alert(
            "Error cambiando estado"
        );

    }

}


// =========================
// FILTROS
// =========================

function aplicarFiltros() {

    const texto =

        document
        .getElementById(
            "buscarUsuario"
        )
        .value
        .toLowerCase();

    const estado =

        document
        .getElementById(
            "filtroEstado"
        )
        .value
        .toLowerCase()
        .trim();

    const rolFiltro =

        document
        .getElementById(
            "filtroRol"
        )
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

            estado === "todos"

            || estadoFila === estado;

        const coincideRol =

            rolFiltro === "todos"

            || rolFila === rolFiltro;

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


// =========================
// MODAL USUARIO
// =========================

function abrirModalUsuario() {

    const selectRol =
        document.getElementById("nuevoRol");

    selectRol.innerHTML = "";

    selectRol.style.pointerEvents = "auto";
    selectRol.style.backgroundColor = "";

    if (usuario.rol === "admin") {

        selectRol.innerHTML = `

            <option value="">
                Seleccionar rol
            </option>

            <option value="admin">
                Administrador
            </option>

            <option value="coordinador">
                Coordinador
            </option>

            <option value="voluntario">
                Voluntario
            </option>

        `;

    } else if (usuario.rol === "coordinador") {

        selectRol.innerHTML = `

            <option value="voluntario">
                Voluntario
            </option>

        `;

        selectRol.value = "voluntario";

        selectRol.style.pointerEvents = "none";

        selectRol.style.backgroundColor = "#f3f4f6";

    }

    document
        .getElementById("modalUsuario")
        .classList
        .remove("hidden");


    document.getElementById(
        "tituloModalUsuario"
    ).textContent = "Nuevo Usuario";

    document.getElementById(
        "nuevoPassword"
    ).style.display = "block";

    document.getElementById(
        "checkRestaurarPassword"
    ).checked = false;

    document.getElementById(
        "btnGuardarUsuario"
    ).textContent =
        "Crear Usuario";

    containerNuevaPassword
        .classList
        .add("hidden");

}

function cerrarModalUsuario() {

    document
        .getElementById("modalUsuario")
        .classList
        .add("hidden");

}

// =========================
// TABLA CAMPAÑAS
// =========================

async function abrirModalCampana() {

    document
        .getElementById("modalCampana")
        .classList
        .remove("hidden");

    await cargarResponsablesCampana();

}

function cerrarModalCampana() {

    document
        .getElementById("modalCampana")
        .classList
        .add("hidden");

    document
        .getElementById("formCampana")
        .reset();

    campanaEditando = null;

}


async function cargarResponsablesCampana() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/usuarios"
            );

        const usuarios =
            await response.json();

        const selectResponsable =
            document.getElementById(
                "campanaResponsable"
            );

        selectResponsable.innerHTML = "";

        // =========================
        // ADMIN
        // =========================

        if (usuario.rol === "admin") {

            responsablesCampana = usuarios.filter(

                u =>

                    u.rol === "admin"
                    ||
                    u.rol === "coordinador"

            );

            responsablesCampana.forEach(u => {

                selectResponsable.innerHTML += `

                    <option value="${u.nombre}">

                        ${u.nombre}

                    </option>

                `;

            });

            selectResponsable.disabled = false;

        }

        // =========================
        // COORDINADOR
        // =========================

        else if (usuario.rol === "coordinador") {

            selectResponsable.innerHTML = `

                <option value="${usuario.nombre}">

                    ${usuario.nombre}

                </option>

            `;

            selectResponsable.disabled = true;

        }

    } catch (error) {

        console.error(error);

    }

}

// =========================
// EDITAR USUARIO
// =========================

async function editarUsuario(id) {

    usuarioEditando = id;

    try {

        const response =
            await fetch(
                "http://localhost:3000/usuarios"
            );

        const usuarios =
            await response.json();

        const usuarioEditar =

            usuarios.find(
                u => u.id_usuario === id
            );

        if (!usuarioEditar) return;

        usuarioEditando = id;

        document.getElementById(
            "tituloModalUsuario"
        ).textContent = "Editar Usuario";

        document.getElementById(
            "nuevoNombre"
        ).value =
            usuarioEditar.nombre;

        document.getElementById(
            "nuevoApellido"
        ).value =
            usuarioEditar.apellido || "";

        document.getElementById(
            "nuevoUsername"
        ).value =
            usuarioEditar.username;

        document.getElementById(
            "nuevoEmail"
        ).value =
            usuarioEditar.email || "";

        document.getElementById(
            "nuevoPassword"
        ).style.display = "none";

        abrirModalUsuario();

        document.getElementById(
            "nuevoPassword"
        ).style.display = "none";

        document.getElementById(
            "nuevoRol"
        ).value =
            usuarioEditar.rol;

        document.getElementById(
            "btnGuardarUsuario"
        ).textContent =
            "Guardar Cambios";
            

    } catch (error) {

        console.error(error);

    }

}


// =========================
// FORM NUEVO USUARIO
// =========================

const formNuevoUsuario =
    document.getElementById(
        "formNuevoUsuario"
    );

formNuevoUsuario.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const nuevoUsuario = {

            usuarioLogueado: usuario,

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

                usuarioEditando

                    ? (

                        checkRestaurarPassword.checked

                            ? document.getElementById(
                                "nuevaPasswordEdit"
                            ).value

                            : null

                    )

                    : document.getElementById(
                        "nuevoPassword"
                    ).value,

            rol:
                document.getElementById(
                    "nuevoRol"
                ).value

        };

        try {

            const url =

                usuarioEditando

                ? `http://localhost:3000/usuarios/${usuarioEditando}`

                : "http://localhost:3000/usuarios";

            const method =

                usuarioEditando

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
                    "Usuario guardado correctamente"
                );

                cerrarModalUsuario();

                formNuevoUsuario.reset();

                usuarioEditando = null;

                cargarModuloUsuarios();

                usuarioEditando = null;

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error(error);

            alert(
                "Error guardando usuario"
            );

        }

    }
);

// =========================
// CREAR / EDITAR CAMPAÑA
// =========================

const formCampana =
    document.getElementById(
        "formCampana"
    );

formCampana.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const nuevaCampana = {

            nombre:
                document.getElementById(
                    "campanaNombre"
                ).value,

            descripcion:
                document.getElementById(
                    "campanaDescripcion"
                ).value,

            fecha_inicio:
                document.getElementById(
                    "campanaFechaInicio"
                ).value,

            fecha_fin:
                document.getElementById(
                    "campanaFechaFin"
                ).value,

            estado:
                document.getElementById(
                    "campanaEstado"
                ).value,

                responsable:
                    document.getElementById(
                        "campanaResponsable"
                    ).value,

            id_usuario_creador:
                usuario.id_usuario

        };

        try {

            const url = campanaEditando

                ? `http://localhost:3000/campanas/${campanaEditando}`

                : "http://localhost:3000/campanas";

            const method = campanaEditando

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
                        nuevaCampana
                    )

                }

            );

            const data =
                await response.json();

            if (response.ok) {

                alert(data.message);

                cerrarModalCampana();

                cargarModuloCampanas();

                cargarEstadisticas();

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error(error);

            alert(
                "Error guardando campaña"
            );

        }

    }
);


// =========================
// MODALES EXISTENTES
// =========================

const modalCampanas =
    document.getElementById(
        "modalCampanas"
    );

const cerrarModalCampanas =
    document.getElementById(
        "cerrarModalCampanas"
    );

if (cerrarModalCampanas) {

    cerrarModalCampanas.addEventListener(
        "click",
        () => {

            modalCampanas.style.display =
                "none";

        }
    );

}


const modalAct =
    document.getElementById(
        "modalActividades"
    );

const cerrarAct =
    document.getElementById(
        "cerrarModalActividades"
    );

if (cerrarAct) {

    cerrarAct.addEventListener(
        "click",
        () => {

            modalAct.style.display =
                "none";

        }
    );

}


const modalIns =
    document.getElementById(
        "modalInscripciones"
    );

const cerrarIns =
    document.getElementById(
        "cerrarModalInscripciones"
    );

if (cerrarIns) {

    cerrarIns.addEventListener(
        "click",
        () => {

            modalIns.style.display =
                "none";

        }
    );

}


const checkRestaurarPassword =
    document.getElementById(
        "checkRestaurarPassword"
    );

const containerNuevaPassword =
    document.getElementById(
        "containerNuevaPassword"
    );

checkRestaurarPassword.addEventListener(
    "change",
    () => {

        if (
            checkRestaurarPassword.checked
        ) {

            containerNuevaPassword
                .classList
                .remove("hidden");

        } else {

            containerNuevaPassword
                .classList
                .add("hidden");

        }

    }
);

// CARGA DE MODULO DE CAMPAÑAS

async function cargarModuloCampanas() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/campanas"
            );

        const data =
            await response.json();

        let filas = "";

        data.forEach(c => {

            const puedeEditarCampana =

                usuario.rol === "admin"

                ||

                (

                    usuario.rol === "coordinador"

                    &&

                    c.responsable === usuario.nombre

                );

            filas += `

                <tr>

                    <td>${c.nombre}</td>

                    <td>${c.responsable}</td>

                    <td>
                        ${new Date(c.fecha_inicio)
                            .toLocaleDateString()}
                    </td>

                    <td>
                        ${new Date(c.fecha_fin)
                            .toLocaleDateString()}
                    </td>

                    <td>${c.estado}</td>

                    <td>

                        ${puedeEditarCampana

                            ? `

                                <button
                                    class="btn-editar"
                                    onclick="editarCampana(${c.id_campana})"
                                >
                                    Editar
                                </button>

                                <button
                                    class="btn-estado"
                                    onclick="cambiarEstadoCampana(
                                        ${c.id_campana},
                                        '${c.estado}'
                                    )"
                                >

                                    ${c.estado === "activa"

                                        ? "Finalizar"

                                        : "Reactivar"}

                                </button>

                            `

                            :

                            `<span>No permitido</span>`

                        }

                    </td>

                </tr>

            `;

        });

        dynamicContent.innerHTML = `

            <div class="usuarios-module">

                <div class="module-header">

                    <h2>
                        Gestión de Campañas
                    </h2>

                    <button
                        class="btn-add"
                        onclick="abrirModalCampana()"
                    >
                        + Nueva Campaña
                    </button>

                </div>

                <table class="usuarios-table">

                    <thead>

                        <tr>

                            <th>Nombre</th>
                            <th>Responsable</th>
                            <th>Inicio</th>
                            <th>Fin</th>
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

    } catch (error) {

        console.error(error);

        dynamicContent.innerHTML = `
            <p>Error cargando campañas</p>
        `;

    }

}

// =========================
// MODULO ACTIVIDADES
// =========================

async function cargarModuloActividades() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/actividades"
            );

        const data =
            await response.json();

        let filas = "";

        data.forEach(a => {

            const puedeEditar =

                usuario.rol === "admin"

                ||

                (

                    usuario.rol === "coordinador"

                    &&

                    a.id_usuario_creador ===
                    usuario.id_usuario

                );

            filas += `

                <tr>

                    <td>${a.nombre}</td>

                    <td>${a.campana || "-"}</td>

                    <td>
                        ${new Date(a.fecha)
                            .toLocaleDateString()}
                    </td>

                    <td>${a.ubicacion}</td>

                    <td>${a.cupos}</td>

                    <td>${a.estado}</td>

                    <td>

                        ${

                            puedeEditar

                                ?

                                `

                                <button
                                    class="btn-editar"
                                    onclick="editarActividad(${a.id_actividad})"
                                >

                                    Editar

                                </button>

                                <button
                                    class="btn-estado"
                                    onclick="cambiarEstadoActividad(
                                        ${a.id_actividad},
                                        '${a.estado}'
                                    )"
                                >

                                    ${

                                        a.estado === "finalizada"

                                            ? "Reactivar"

                                            : "Finalizar"

                                    }

                                </button>

                                `

                                :

                                `No permitido`

                        }

                    </td>

                    </td>

                </tr>

            `;

        });

        dynamicContent.innerHTML = `

            <div class="usuarios-module">

                <div class="module-header">

                    <h2>
                        Gestión de Actividades
                    </h2>

                    <button
                        class="btn-add"
                        onclick="abrirModalActividad()"
                    >
                        + Nueva Actividad
                    </button>

                </div>

                <div class="filters-container">

                    <input
                        type="text"
                        id="buscarActividad"
                        placeholder="Buscar actividad..."
                    >

                    <select id="filtroEstadoActividad">

                        <option value="todos">
                            Todos los estados
                        </option>

                        <option value="pendiente">
                            Pendiente
                        </option>

                        <option value="en_curso">
                            En Curso
                        </option>

                        <option value="finalizada">
                            Finalizada
                        </option>

                    </select>

                    <select id="filtroCampanaActividad">

                        <option value="todos">
                            Todas las campañas
                        </option>

                        ${[...new Set(
                            data.map(a => a.campana)
                        )]

                            .map(c => `

                                <option value="${c}">
                                    ${c}
                                </option>

                            `)

                            .join("")}

                    </select>

                </div>

                <table class="usuarios-table">

                    <thead>

                        <tr>

                            <th>Nombre</th>
                            <th>Campaña</th>
                            <th>Fecha</th>
                            <th>Ubicación</th>
                            <th>Cupos</th>
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

        const buscarActividad =
            document.getElementById(
                "buscarActividad"
            );

        const filtroEstadoActividad =
            document.getElementById(
                "filtroEstadoActividad"
            );

        const filtroCampanaActividad =
            document.getElementById(
                "filtroCampanaActividad"
            );

        buscarActividad.addEventListener(
            "input",
            aplicarFiltrosActividades
        );

        filtroEstadoActividad.addEventListener(
            "change",
            aplicarFiltrosActividades
        );

        filtroCampanaActividad.addEventListener(
            "change",
            aplicarFiltrosActividades
        );

    } catch (error) {

        console.error(error);

        dynamicContent.innerHTML =
            `<p>Error cargando actividades</p>`;

    }

}

// =========================
// MODAL ACTIVIDAD
// =========================

let actividadEditando = null;

async function abrirModalActividad() {

    document
        .getElementById("modalActividad")
        .classList
        .remove("hidden");

    await cargarCampanasActividad();

}

function cerrarModalActividad() {

    document
        .getElementById("modalActividad")
        .classList
        .add("hidden");

    document
        .getElementById("formActividad")
        .reset();

    actividadEditando = null;

}


// =========================
// CARGAR CAMPAÑAS
// =========================

async function cargarCampanasActividad() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/campanas"
            );

        const campanas =
            await response.json();

        const select =
            document.getElementById(
                "actividadCampana"
            );

        select.innerHTML = "";

        const campanasDisponibles =

            campanas.filter(c => {

                // SOLO ACTIVAS

                if (c.estado !== "activa") {

                    return false;

                }

                // ADMIN

                if (usuario.rol === "admin") {

                    return true;

                }

                // COORDINADOR

                return (
                    c.responsable === usuario.nombre
                );

            });

        campanasDisponibles.forEach(c => {

            select.innerHTML += `

                <option value="${c.id_campana}">

                    ${c.nombre}

                </option>

            `;

        });

    } catch (error) {

        console.error(error);

    }

}

// =========================
// CREAR ACTIVIDAD
// =========================

const formActividad =
    document.getElementById(
        "formActividad"
    );

    formActividad.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const nuevaActividad = {

            nombre:
                document.getElementById(
                    "actividadNombre"
                ).value,

            descripcion:
                document.getElementById(
                    "actividadDescripcion"
                ).value,

            fecha:
                document.getElementById(
                    "actividadFecha"
                ).value,

            ubicacion:
                document.getElementById(
                    "actividadUbicacion"
                ).value,

            cupos:
                document.getElementById(
                    "actividadCupos"
                ).value,

            estado:
                document.getElementById(
                    "actividadEstado"
                ).value,

            id_campana:
                document.getElementById(
                    "actividadCampana"
                ).value,

            id_usuario_creador:
                usuario.id_usuario

        };

        try {

            const url = actividadEditando

                ? `http://localhost:3000/actividades/${actividadEditando}`

                : "http://localhost:3000/actividades";

            const method =
                actividadEditando
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

                    body: JSON.stringify({

                        ...nuevaActividad,

                        usuarioLogueado:
                            usuario

                    })

                }

            );

            const data =
                await response.json();

            if (response.ok) {

                alert(data.message);

                cerrarModalActividad();

                cargarModuloActividades();

                cargarEstadisticas();

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error(error);

            alert(
                "Error creando actividad"
            );

        }

    }
);

// =========================
// EDITAR ACTIVIDAD
// =========================

async function editarActividad(id) {

    try {

        const response =
            await fetch(
                "http://localhost:3000/actividades"
            );

        const actividades =
            await response.json();

        const actividadEditar =

            actividades.find(
                a => a.id_actividad === id
            );

        if (!actividadEditar) return;

        // =========================
        // FINALIZADA
        // =========================

        if (
            actividadEditar.estado ===
            "finalizada"
        ) {

            alert(
                "La actividad está finalizada"
            );

            return;

        }

        actividadEditando = id;

        // =========================
        // TITULO
        // =========================

        document.getElementById(
            "tituloModalActividad"
        ).textContent =
            "Editar Actividad";

        document.getElementById(
            "btnGuardarActividad"
        ).textContent =
            "Guardar Cambios";

        // =========================
        // CAMPAÑAS
        // =========================

        await cargarCampanasActividad();

        // =========================
        // DATOS
        // =========================

        document.getElementById(
            "actividadNombre"
        ).value =
            actividadEditar.nombre;

        document.getElementById(
            "actividadDescripcion"
        ).value =
            actividadEditar.descripcion;

        document.getElementById(
            "actividadFecha"
        ).value =
            actividadEditar.fecha
                .split("T")[0];

        document.getElementById(
            "actividadUbicacion"
        ).value =
            actividadEditar.ubicacion;

        document.getElementById(
            "actividadCupos"
        ).value =
            actividadEditar.cupos;

        document.getElementById(
            "actividadEstado"
        ).value =
            actividadEditar.estado;

        document.getElementById(
            "actividadCampana"
        ).value =
            actividadEditar.id_campana;

        abrirModalActividad();

    } catch (error) {

        console.error(error);

    }

}

// =========================
// CAMBIAR ESTADO ACTIVIDAD
// =========================

async function cambiarEstadoActividad(
    id,
    estadoActual
) {

    try {

        const nuevoEstado =

            estadoActual === "finalizada"

                ? "pendiente"

                : "finalizada";

        const response = await fetch(

            `http://localhost:3000/actividades/${id}/estado`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    estado:
                        nuevoEstado,

                    usuarioLogueado:
                        usuario

                })

            }

        );

        const data =
            await response.json();

        alert(data.message);

        cargarModuloActividades();

    } catch (error) {

        console.error(error);

    }

}

// =========================
// FILTROS ACTIVIDADES
// =========================

function aplicarFiltrosActividades() {

    const texto =

        document.getElementById(
            "buscarActividad"
        )

        .value

        .toLowerCase();

    const estado =

        document.getElementById(
            "filtroEstadoActividad"
        )

        .value;

    const campana =

        document.getElementById(
            "filtroCampanaActividad"
        )

        .value;

    const filas =
        document.querySelectorAll(
            ".usuarios-table tbody tr"
        );

    filas.forEach(fila => {

        const nombre =

            fila.children[0]
            .textContent
            .toLowerCase();

        const campanaFila =

            fila.children[1]
            .textContent;

        const estadoFila =

            fila.children[5]
            .textContent;

        const coincideTexto =

            nombre.includes(texto);

        const coincideEstado =

            estado === "todos"

            ||

            estadoFila === estado;

        const coincideCampana =

            campana === "todos"

            ||

            campanaFila === campana;

        fila.style.display =

            coincideTexto
            &&
            coincideEstado
            &&
            coincideCampana

                ? ""

                : "none";

    });

}

// =========================
// EDITAR CAMPAÑA
// =========================

async function editarCampana(id) {

    try {

        const response =
            await fetch(
                `http://localhost:3000/campanas/${id}`
            );

        const campanaEditar =
            await response.json();

        if (!campanaEditar) return;

        campanaEditando = id;

        await abrirModalCampana();

        document.getElementById(
            "tituloModalCampana"
        ).textContent =
            "Editar Campaña";

        document.getElementById(
            "btnGuardarCampana"
        ).textContent =
            "Guardar Cambios";

        document.getElementById(
            "campanaNombre"
        ).value =
            campanaEditar.nombre;

        document.getElementById(
            "campanaDescripcion"
        ).value =
            campanaEditar.descripcion || "";

        document.getElementById(
            "campanaFechaInicio"
        ).value =
            campanaEditar.fecha_inicio.split("T")[0];

        document.getElementById(
            "campanaFechaFin"
        ).value =
            campanaEditar.fecha_fin.split("T")[0];

        document.getElementById(
            "campanaEstado"
        ).value =
            campanaEditar.estado;

        document.getElementById(
            "campanaResponsable"
        ).value =
            campanaEditar.responsable;

    } catch (error) {

        console.error(error);

        alert(
            "Error cargando campaña"
        );

    }

}

// =========================
// CAMBIAR ESTADO CAMPAÑA
// =========================

async function cambiarEstadoCampana(
    id,
    estadoActual
) {

    const nuevoEstado =

        estadoActual === "activa"

        ? "finalizada"

        : "activa";

    try {

        const response = await fetch(

            `http://localhost:3000/campanas/${id}/estado`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    estado: nuevoEstado,

                    usuarioLogueado: usuario,

                    finalizado_por:

                        nuevoEstado === "finalizada"

                        ? usuario.nombre

                        : null

                })

            }

        );

        const data =
            await response.json();

        if (response.ok) {

            alert(data.message);

            cargarModuloCampanas();

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert(
            "Error cambiando estado"
        );

    }

}

// =========================
// MODULO INSCRIPCIONES
// =========================

async function cargarModuloInscripciones() {

    try {

        const responseInscripciones =
            await fetch(
                "http://localhost:3000/inscripciones"
            );

        const inscripciones =
            await responseInscripciones.json();

        const responseUsuarios =
            await fetch(
                "http://localhost:3000/usuarios"
            );

        const usuarios =
            await responseUsuarios.json();

        const responseActividades =
            await fetch(
                "http://localhost:3000/actividades"
            );

        const actividades =
            await responseActividades.json();

        const voluntarios =
            usuarios.filter(u =>

                u.rol === "voluntario"
                &&
                u.estado === "activo"

            );

        const actividadesDisponibles =
            actividades.filter(a =>

                a.estado !== "finalizada"
                &&
                a.cupos > 0

            );

        let filas = "";

        inscripciones.forEach(i => {

            filas += `

                <tr>

                    <td>${i.voluntario}</td>

                    <td>${i.actividad}</td>

                    <td>${i.campana || "-"}</td>

                    <td>
                        ${new Date(
                            i.fecha_inscripcion
                        ).toLocaleDateString()}
                    </td>

                    <td>

                        <span class="${
                            i.estado === "cancelada"
                                ? "btn-cancelado"
                                : "btn-inscripto"
                        }">

                            ${i.estado}

                        </span>

                    </td>

                    <td>

                        ${

                            i.estado === "cancelada"

                            ?

                            `

                            <button
                                class="btn-cancelado"
                                disabled
                            >
                                Cancelada
                            </button>

                            `

                            :

                            `

                            <button
                                class="btn-estado"
                                onclick="
                                    cancelarInscripcion(
                                        ${i.id_inscripcion}
                                    )
                                "
                            >
                                Cancelar
                            </button>

                            `

                        }

                    </td>

                </tr>

            `;

        });

        dynamicContent.innerHTML = `

            <div class="usuarios-module">

                <div class="module-header">

                    <h2>
                        Gestión de Inscripciones
                    </h2>

                </div>

                <!-- FORM -->

                <div class="form-section">

                    <h3>
                        Nueva Inscripción
                    </h3>

                    <div class="form-grid">

                        <select id="selectVoluntario">

                            <option value="">
                                Seleccionar voluntario
                            </option>

                            ${voluntarios.map(v => `

                                <option value="${v.id_usuario}">

                                    ${v.nombre} ${v.apellido}

                                </option>

                            `).join("")}

                        </select>

                        <select id="selectActividad">

                            <option value="">
                                Seleccionar actividad
                            </option>

                            ${actividadesDisponibles.map(a => `

                                <option value="${a.id_actividad}">

                                    ${a.nombre}

                                </option>

                            `).join("")}

                        </select>

                    </div>

                    <button
                        class="btn-save"
                        onclick="crearInscripcionAdmin()"
                    >
                        Inscribir Voluntario
                    </button>

                </div>

                <!-- FILTROS -->

                <div class="filter-group">

                    <input
                        type="text"
                        id="buscarInscripcion"
                        placeholder="Buscar voluntario..."
                    >

                    <select id="filtroEstadoInscripcion">

                        <option value="todos">
                            Todos los estados
                        </option>

                        <option value="activa">
                            Activa
                        </option>

                        <option value="cancelada">
                            Cancelada
                        </option>

                    </select>

                    <select id="filtroActividadInscripcion">

                        <option value="todos">
                            Todas las actividades
                        </option>

                        ${[...new Set(
                            inscripciones.map(
                                i => i.actividad
                            )
                        )]

                            .map(a => `

                                <option value="${a}">
                                    ${a}
                                </option>

                            `)

                            .join("")}

                    </select>

                    <select id="filtroCampanaInscripcion">

                        <option value="todos">
                            Todas las campañas
                        </option>

                        ${[...new Set(
                            inscripciones.map(
                                i => i.campana
                            )
                        )]

                            .map(c => `

                                <option value="${c}">
                                    ${c}
                                </option>

                            `)

                            .join("")}

                    </select>

                </div>

                                <!-- TABLA -->

                                <div class="table-container">

                                    <table class="usuarios-table">

                                        <thead>

                                            <tr>

                                                <th>Voluntario</th>
                                                <th>Actividad</th>
                                                <th>Campaña</th>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            ${filas}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        `;

                        // =========================
                        // EVENTOS FILTRO
                        // =========================

                        document.getElementById(
                            "buscarInscripcion"
                        ).addEventListener(
                            "input",
                            aplicarFiltrosInscripciones
                        );

                        document.getElementById(
                            "filtroEstadoInscripcion"
                        ).addEventListener(
                            "change",
                            aplicarFiltrosInscripciones
                        );

                        document.getElementById(
                            "filtroActividadInscripcion"
                        ).addEventListener(
                            "change",
                            aplicarFiltrosInscripciones
                        );

                        document.getElementById(
                            "filtroCampanaInscripcion"
                        ).addEventListener(
                            "change",
                            aplicarFiltrosInscripciones
                        );

                    } catch (error) {

                        console.error(error);

                        dynamicContent.innerHTML =
                            `<p>Error cargando inscripciones</p>`;

                    }

                }


function aplicarFiltrosInscripciones() {

    const texto =

        document.getElementById(
            "buscarInscripcion"
        )

        .value
        .toLowerCase();

    const estado =

        document.getElementById(
            "filtroEstadoInscripcion"
        )

        .value;

    const actividad =

        document.getElementById(
            "filtroActividadInscripcion"
        )

        .value;

    const campana =

        document.getElementById(
            "filtroCampanaInscripcion"
        )

        .value;

    const filas =
        document.querySelectorAll(
            ".usuarios-table tbody tr"
        );

    filas.forEach(fila => {

        const voluntario =

            fila.children[0]
            .textContent
            .toLowerCase();

        const actividadFila =

            fila.children[1]
            .textContent;

        const campanaFila =

            fila.children[2]
            .textContent;

        const estadoFila =

            fila.children[4]
            .textContent
            .toLowerCase();

        const coincideTexto =

            voluntario.includes(texto);

        const coincideEstado =

            estado === "todos"

            ||

            estadoFila.includes(estado);

        const coincideActividad =

            actividad === "todos"

            ||

            actividadFila === actividad;

        const coincideCampana =

            campana === "todos"

            ||

            campanaFila === campana;

        fila.style.display =

            coincideTexto
            &&
            coincideEstado
            &&
            coincideActividad
            &&
            coincideCampana

                ? ""

                : "none";

    });

}


async function crearInscripcionAdmin() {

    const id_voluntario =
        document.getElementById(
            "selectVoluntario"
        ).value;

    const id_actividad =
        document.getElementById(
            "selectActividad"
        ).value;

    if (!id_voluntario || !id_actividad) {

        alert(
            "Completa todos los campos"
        );

        return;

    }

    try {

        const response = await fetch(

            "http://localhost:3000/inscripciones",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    id_usuario:
                        id_voluntario,

                    id_actividad

                })

            }

        );

        const data =
            await response.json();

        alert(data.message);

        cargarModuloInscripciones();

        cargarEstadisticas();

    } catch (error) {

        console.error(error);

    }

}

async function cancelarInscripcion(id) {

    try {

        const response = await fetch(

            `http://localhost:3000/inscripciones/${id}`,

            {

                method: "DELETE"

            }

        );

        const data =
            await response.json();

        alert(data.message);

        cargarModuloInscripciones();

        cargarEstadisticas();

    } catch (error) {

        console.error(error);

    }

}

// =========================
// MODULO COMENTARIOS
// =========================

async function mostrarComentarios() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/comentarios"
            );

        const comentarios =
            await response.json();

        let filas = "";

        comentarios.forEach(c => {

            filas += `

                <tr>

                    <td>
                        ${c.usuario}
                    </td>

                    <td>
                        ${c.actividad}
                    </td>

                    <td>
                        ${c.comentario}
                    </td>

                    <td>
                        ${new Date(
                            c.fecha_comentario
                        ).toLocaleDateString()}
                    </td>

                    <td>
                        ${c.estado}
                    </td>

                    <td>

                        <button
                            class="btn-delete"
                            onclick="eliminarComentario(
                                ${c.id_comentario}
                            )"
                        >
                            Eliminar
                        </button>

                    </td>

                </tr>

            `;

        });

        dynamicContent.innerHTML = `

            <div class="usuarios-module">

                <div class="module-header">

                    <h2>
                        Gestión de Comentarios
                    </h2>

                </div>

                <table class="usuarios-table">

                    <thead>

                        <tr>

                            <th>Usuario</th>
                            <th>Actividad</th>
                            <th>Comentario</th>
                            <th>Fecha</th>
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

    } catch (error) {

        console.error(error);

        dynamicContent.innerHTML =

            "<p>Error cargando comentarios</p>";

    }

}

async function eliminarComentario(
    idComentario
) {

    const confirmar = confirm(

        "¿Deseas eliminar este comentario?"

    );

    if (!confirmar) return;

    try {

        const response =
            await fetch(

                `http://localhost:3000/comentarios/${idComentario}/eliminar`,

                {
                    method: "PUT"
                }

            );

        const data =
            await response.json();

        alert(
            data.message
        );

        mostrarComentarios();

    } catch (error) {

        console.error(error);

        alert(
            "Error eliminando comentario"
        );

    }

}

function mostrarInicio() {

    dynamicContent.innerHTML = `

        <div class="usuarios-module">


            <div class="dashboard-grid">

                <div class="dashboard-panel">

                    <h3>
                        📅 Próximas Actividades
                    </h3>

                    <div id="panelActividades">

                        Cargando...

                    </div>

                </div>

                <div class="dashboard-panel">

                    <h3>
                        📝 Últimas Inscripciones
                    </h3>

                    <div id="panelInscripciones">

                        Cargando...

                    </div>

                </div>

            </div>

            <div class="dashboard-panel">

                <h3>
                    💬 Comentarios Recientes
                </h3>

                <div id="panelComentarios">

                    Cargando...

                </div>

            </div>

        </div>

    `;

    cargarEstadisticas();

    cargarResumenDashboard();

}

function formatearFecha(fecha) {

    if (!fecha) return "-";

    return new Date(fecha)
        .toLocaleDateString(
            "es-PY",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}

async function cargarResumenDashboard() {

    try {

        // ACTIVIDADES

        const actividadesResponse =
            await fetch(
                "http://localhost:3000/actividades"
            );

        const actividades =
            await actividadesResponse.json();

        const proximas =
            actividades
                .sort(

                    (a, b) =>

                        new Date(a.fecha)
                        -
                        new Date(b.fecha)

                )
                .slice(0, 5);

        document.getElementById(
            "panelActividades"
        ).innerHTML = proximas.map(

            actividad => `

                <div class="mini-item">

                    <strong>
                        ${actividad.nombre}
                    </strong>

                    <span>
                        ${formatearFecha(
                            actividad.fecha
                        )}
                    </span>

                </div>

            `

        ).join("");

        console.log("Actividades:", actividades);

        // INSCRIPCIONES

        const inscripcionesResponse =
            await fetch(
                "http://localhost:3000/inscripciones"
            );

        const inscripciones =
            await inscripcionesResponse.json();

        const ultimasInscripciones =
            inscripciones.slice(0, 5);

        document.getElementById(
            "panelInscripciones"
        ).innerHTML = ultimasInscripciones.map(

            inscripcion => `

                <div class="mini-item">

                    <strong>
                        ${inscripcion.voluntario}
                    </strong>

                    <span>
                        ${inscripcion.actividad}
                    </span>

                </div>

            `

        ).join("");

        console.log("Inscripciones:", inscripciones);

        // COMENTARIOS

        const comentariosResponse =
            await fetch(
                "http://localhost:3000/comentarios"
            );

        const comentarios =
            await comentariosResponse.json();

        const recientes =
            comentarios
                .filter(
                    c => c.estado === "activo"
                )
                .slice(0, 5);

        document.getElementById(
            "panelComentarios"
        ).innerHTML = recientes.map(

            comentario => `

                <div class="comentario-item">

                    <strong>
                        ${comentario.usuario}
                    </strong>

                    <p>
                        "${comentario.comentario}"
                    </p>

                </div>

            `

        ).join("");

        console.log("Comentarios:", comentarios);

    } catch (error) {

        console.error(error);

    }

}

mostrarInicio();

cargarNotificaciones();



async function mostrarConfiguracion() {

    activarMenu("btnConfiguracion");

    const contenido =
        document.getElementById(
            "dynamicContent"
        );

    try {

        const configResponse =
            await fetch(
                "http://localhost:3000/configuracion"
            );

        const config =
            await configResponse.json();

        const sistemaResponse =
            await fetch(
                "http://localhost:3000/configuracion/sistema"
            );

        const sistema =
            await sistemaResponse.json();

        contenido.innerHTML = `

        <div class="configuracion-container">

            <!-- INFORMACION -->

            <div class="accordion-item">

                <button class="accordion-header">
                    🏢 Información Institucional
                </button>

                <div class="accordion-content">

                    <div id="panelInfoInstitucional">
                        Cargando...
                    </div>

                </div>

            </div>

            <!-- SISTEMA -->

            <div class="accordion-item">

                <button class="accordion-header">
                    ⚙️ Configuración Plataforma
                </button>

                <div class="accordion-content">

                    <div id="panelConfigSistema">
                        Cargando...
                    </div>

                </div>

            </div>

            <!-- REGLAS -->

            <div class="accordion-item">

                <button class="accordion-header">
                    📋 Reglas Operativas
                </button>

                <div class="accordion-content">

                    <div id="panelReglas">
                        Cargando...
                    </div>

                </div>

            </div>

            <!-- REPORTES -->

            <div class="accordion-item">

                <button class="accordion-header">
                    📊 Reportes
                </button>

                <div class="accordion-content">

                    <div
                        id="panelReportes"
                        class="reportes-grid"
                    >

                        <button
                            class="btn-estado"
                            onclick="exportarUsuariosCSV()"
                        >
                            Usuarios CSV
                        </button>

                        <button
                            class="btn-estado"
                            onclick="exportarActividadesCSV()"
                        >
                            Actividades CSV
                        </button>

                        <button
                            class="btn-estado"
                            onclick="exportarInscripcionesCSV()"
                        >
                            Inscripciones CSV
                        </button>

                        <button
                            class="btn-estado"
                            onclick="exportarComentariosCSV()"
                        >
                            Comentarios CSV
                        </button>

                    </div>

                </div>

            </div>

        </div>

        `;

        document
            .querySelectorAll(
                ".accordion-header"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        btn.parentElement
                            .classList
                            .toggle("active");

                    }
                );

            });
        // ABRIR EL PRIMER PANEL AUTOMÁTICAMENTE

                document
                    .querySelector(
                        ".accordion-item"
                    )
                    .classList
                    .add("active");

        // PANEL INFORMACION

        document.getElementById(
            "panelInfoInstitucional"
        ).innerHTML = `

            <div class="config-grid">

                <div>

                    <label>Organización</label>

                    <input
                        id="configNombre"
                        type="text"
                        value="${config.nombre_organizacion || ''}"
                    >

                </div>

                <div>

                    <label>Email</label>

                    <input
                        id="configEmail"
                        type="email"
                        value="${config.email_contacto || ''}"
                    >

                </div>

                <div>

                    <label>Teléfono</label>

                    <input
                        id="configTelefono"
                        type="text"
                        value="${config.telefono || ''}"
                    >

                </div>

                <div>

                    <label>Dirección</label>

                    <textarea
                        id="configDireccion"
                    >${config.direccion || ''}</textarea>

                </div>

            </div>

            <div style="margin-top:20px;">

                <button
                    id="btnGuardarConfig"
                    class="btn-estado"
                    onclick="guardarConfiguracionGeneral()"
                >
                    Guardar Cambios
                </button>

            </div>

        `;


        // PANEL SISTEMA

        document.getElementById(
            "panelConfigSistema"
        ).innerHTML = `

            <div class="config-checks">

                <label>

                    <input
                        id="permitirRegistro"
                        type="checkbox"
                        ${sistema.permitir_registro ? "checked" : ""}
                    >

                    Permitir registros

                </label>

                <label>

                    <input
                        id="permitirComentarios"
                        type="checkbox"
                        ${sistema.permitir_comentarios ? "checked" : ""}
                    >

                    Permitir comentarios

                </label>

                <label>

                    <input
                        id="permitirReinscripciones"
                        type="checkbox"
                        ${sistema.permitir_reinscripciones ? "checked" : ""}
                    >

                    Permitir reinscripciones

                </label>

                <label>

                    <input
                        id="mostrarFinalizadas"
                        type="checkbox"
                        ${sistema.mostrar_finalizadas ? "checked" : ""}
                    >

                    Mostrar finalizadas

                </label>

            </div>

            <div style="margin-top:20px;">

                <button
                    id="btnGuardarSistema"
                    class="btn-estado"
                    onclick="guardarConfigSistema()"
                >
                    Guardar Cambios
                </button>

            </div>

        `;


        // PANEL REGLAS

        document.getElementById(
            "panelReglas"
        ).innerHTML = `

            <div class="config-grid">

                <div>

                    <label>
                        Días cancelación
                    </label>

                    <input
                        id="diasCancelacion"
                        type="number"
                        value="${sistema.dias_cancelacion}"
                    >

                </div>

                <div>

                    <label>
                        Cupos por defecto
                    </label>

                    <input
                        id="cuposDefault"
                        type="number"
                        value="${sistema.cupos_default}"
                    >

                </div>

            </div>

            <div style="margin-top:20px;">

                <button
                    class="btn-estado"
                    onclick="guardarConfigSistema()"
                >
                    Guardar Reglas
                </button>

            </div>

        `;
                } catch (error) {

        console.error(error);

        contenido.innerHTML =
            "Error cargando configuración";

    }

}
    

async function guardarConfiguracion() {

    await fetch(

        "http://localhost:3000/configuracion",

        {

            method: "PUT",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify({

                nombre_organizacion:
                    document.getElementById(
                        "nombreOrganizacion"
                    ).value,

                email_contacto:
                    document.getElementById(
                        "emailContacto"
                    ).value,

                telefono:
                    document.getElementById(
                        "telefonoContacto"
                    ).value,

                direccion:
                    document.getElementById(
                        "direccionContacto"
                    ).value

            })

        }

    );

    alert(
        "Configuración guardada"
    );

}

async function guardarConfigSistema() {

    console.log("Guardar sistema");

        console.log(
            document.getElementById(
                "permitirComentarios"
            ).checked
        );

    const boton =
        document.getElementById(
            "btnGuardarSistema"
        );

    try {

        boton.disabled = true;

        boton.innerText =
            "Guardando...";

        await fetch(

            "http://localhost:3000/configuracion/sistema",

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    permitir_registro:
                        document.getElementById(
                            "permitirRegistro"
                        ).checked,

                    permitir_comentarios:
                        document.getElementById(
                            "permitirComentarios"
                        ).checked,

                    permitir_reinscripciones:
                        document.getElementById(
                            "permitirReinscripciones"
                        ).checked,

                    mostrar_finalizadas:
                        document.getElementById(
                            "mostrarFinalizadas"
                        ).checked,

                    dias_cancelacion:
                        parseInt(

                            document.getElementById(
                                "diasCancelacion"
                            ).value

                        ),

                    cupos_default:
                        parseInt(

                            document.getElementById(
                                "cuposDefault"
                            ).value

                        )

                })

            }

        );

        boton.innerHTML =
            "✓ Guardado";

        boton.classList.add(
            "btn-success"
        );

        setTimeout(() => {

            boton.innerText =
                "Guardar Cambios";

            boton.disabled = false;

            boton.classList.remove(
                "btn-success"
            );

        }, 2000);

    } catch (error) {

        console.error(error);

        boton.innerText =
            "Error";

    }

}

async function guardarConfiguracionGeneral() {

    const boton =
    document.getElementById(
        "btnGuardarConfig"
    );

    boton.disabled = true;

    boton.innerText =
        "Guardando...";

    try {

        const response =
            await fetch(

                "http://localhost:3000/configuracion",

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        nombre_organizacion:
                            document.getElementById(
                                "configNombre"
                            ).value,

                        email_contacto:
                            document.getElementById(
                                "configEmail"
                            ).value,

                        telefono:
                            document.getElementById(
                                "configTelefono"
                            ).value,

                        direccion:
                            document.getElementById(
                                "configDireccion"
                            ).value

                    })

                }

            );

        const data =
            await response.json();

        boton.innerHTML =
            "✓ Guardado";

        boton.classList.add(
            "btn-success"
        );

        setTimeout(() => {

            boton.innerText =
                "Guardar Cambios";

            boton.disabled = false;

            boton.classList.remove(
                "btn-success"
            );

        }, 7000);

    } catch (error) {

        console.error(error);

        alert(
            "Error guardando configuración"
        );

    }

}

function exportarUsuariosCSV() {

    window.open(

        "http://localhost:3000/reportes/usuarios",

        "_blank"

    );

}

function exportarActividadesCSV() {

    window.open(

        "http://localhost:3000/reportes/actividades",

        "_blank"

    );

}

function exportarInscripcionesCSV() {

    window.open(

        "http://localhost:3000/reportes/inscripciones",

        "_blank"

    );

}

function exportarComentariosCSV() {

    window.open(

        "http://localhost:3000/reportes/comentarios",

        "_blank"

    );

}

async function cargarNotificaciones() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/solicitudes-reactivacion"
            );

        const solicitudes =
            await response.json();

        contadorNotificaciones.textContent =
            solicitudes.length;

        let html = "";

        solicitudes.forEach(s => {

            html += `

                <div
                    style="
                        border-bottom:1px solid #eee;
                        padding:10px 0;
                    "
                >

                    <strong>

                        ${s.nombre}
                        ${s.apellido}

                    </strong>

                    <br>

                    @${s.username}

                    <br><br>

                    <button
                        onclick="
                            aprobarSolicitud(
                                ${s.id_solicitud},
                                ${s.id_usuario}
                            )
                        "
                    >
                        Aprobar
                    </button>

                    <button
                        onclick="
                            rechazarSolicitud(
                                ${s.id_solicitud}
                            )
                        "
                    >
                        Rechazar
                    </button>

                </div>

            `;

        });

        listaNotificaciones.innerHTML =
            html;

    } catch (error) {

        console.error(error);

    }

}

btnNotificaciones.addEventListener(
    "click",
    () => {

        panelNotificaciones
            .classList
            .toggle("hidden");

    }
);


async function aprobarSolicitud(idSolicitud) {

    try {

        const response =
            await fetch(

                `http://localhost:3000/solicitudes-reactivacion/${idSolicitud}/aprobar`,

                {
                    method: "PUT"
                }

            );

        const data =
            await response.json();

        alert(data.message);

        cargarNotificaciones();

        cargarModuloUsuarios();

    } catch (error) {

        console.error(error);

    }

}

async function rechazarSolicitud(idSolicitud) {

    try {

        const response =
            await fetch(

                `http://localhost:3000/solicitudes-reactivacion/${idSolicitud}/rechazar`,

                {
                    method: "PUT"
                }

            );

        const data =
            await response.json();

        alert(data.message);

        cargarNotificaciones();

    } catch (error) {

        console.error(error);

    }

}

setInterval(() => {

    cargarNotificaciones();

}, 30000);