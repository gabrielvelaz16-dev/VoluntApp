// frontend/assets/js/dashboard.js

const usuario =
    JSON.parse(localStorage.getItem("usuario"));

const rol = usuario?.rol;


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
// ESTADISTICAS DASHBOARD
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

            dynamicContent.innerHTML = "";

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

            modalIns.style.display =
                "flex";

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
// CARGA INICIAL
// =========================

//cargarModuloUsuarios();
