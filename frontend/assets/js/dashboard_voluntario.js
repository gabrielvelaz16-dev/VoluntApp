const usuario = JSON.parse(
    localStorage.getItem("usuario")
);

// =========================
// VALIDAR LOGIN
// =========================

if (!usuario) {

    window.location.href =
        "../../index.html";

}

// =========================
// MOSTRAR NOMBRE
// =========================

document.getElementById(
    "nombreVoluntario"
).innerText =

    `Bienvenido, ${usuario.nombre}`;


// =========================
// CERRAR SESIÓN
// =========================

function formatearFecha(fecha) {

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


function cerrarSesion() {

    localStorage.removeItem(
        "usuario"
    );

    localStorage.removeItem(
        "rol"
    );

    window.location.href =
        "login.html";

}

// =========================
// INICIO
// =========================

async function mostrarInicioVoluntario() {

    activarMenu("menuInicio");

    const usuario = JSON.parse(
        localStorage.getItem("usuario")
    );

    const response = await fetch(
        `http://localhost:3000/perfil/${usuario.id_usuario}/estadisticas`
    );

    const stats = await response.json();

    document.getElementById(
        "contenidoVoluntario"
    ).innerHTML = `

        <div class="dashboard-header">

            <h1>
                ¡Bienvenido ${usuario.nombre}!
            </h1>

            <p>
                Aquí puedes gestionar tus actividades e inscripciones.
            </p>

        </div>

        <div class="stats-grid">

            <div class="stat-card">

                <h3>${stats.total}</h3>

                <p>Inscripciones</p>

            </div>

            <div class="stat-card">

                <h3>${stats.activas}</h3>

                <p>Activas</p>

            </div>

            <div class="stat-card">

                <h3>${stats.canceladas}</h3>

                <p>Canceladas</p>

            </div>

        </div>

        <div id="proximaActividad"></div>

        <div id="ultimasActividades"></div>

    `;

    cargarProximaActividad();

    cargarUltimasActividades();
}

async function cargarProximaActividad() {

    const usuario = JSON.parse(
        localStorage.getItem("usuario")
    );

    const response = await fetch(
        `http://localhost:3000/inscripciones/proxima/${usuario.id_usuario}`
    );

    if (!response.ok) return;

    const actividad = await response.json();

    document.getElementById(
        "proximaActividad"
    ).innerHTML = `

        <div class="module-card">

            <h2>
                📅 Próxima Actividad
            </h2>

            <div class="actividad-destacada">

                <h3>
                    ${actividad.actividad}
                </h3>

                <p>
                    📅 ${formatearFecha(actividad.fecha)}
                </p>

                <p>
                    ${actividad.ubicacion}
                </p>

            </div>

        </div>

    `;
}


async function cargarUltimasActividades() {

    const response = await fetch(
        "http://localhost:3000/actividades"
    );

    const actividades = await response.json();

        window.actividadesOriginales = actividades;

        const campanas = [

            ...new Set(

                actividades.map(
                    a => a.campana
                )

            )

        ];

        const estados = [

            ...new Set(

                actividades.map(
                    a => a.estado
                )

            )

        ];

        const ubicaciones = [

            ...new Set(

                actividades.map(
                    a => a.ubicacion
                )

            )

        ];

    const ultimas = actividades.slice(0, 3);

    document.getElementById(
        "ultimasActividades"
    ).innerHTML = `

        <div class="module-card">

            <h2>
                Actividades Disponibles
            </h2>

            <div class="cards-actividades">

                ${ultimas.map(a => `

                    <div class="actividad-card">

                        <h4>${a.nombre}</h4>

                        <p>
                            📅 ${formatearFecha(a.fecha)}
                        </p>

                        <p>
                            📍 ${a.ubicacion}
                        </p>

                    </div>

                `).join("")}

            </div>

        </div>

    `;
}



// =========================
// ACTIVIDADES DISPONIBLES
// =========================

async function mostrarActividadesDisponibles() {

    activarMenu(
    "menuActividades"
    );

    const contenido =
        document.getElementById(
            "contenidoVoluntario"
        );

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );

    try {

        // ACTIVIDADES

        const response =
            await fetch(
                "http://localhost:3000/actividades"
            );

        const actividades =
            await response.json();

        // INSCRIPCIONES

        const responseInscripciones =
            await fetch(
                "http://localhost:3000/inscripciones"
            );

        const inscripciones =
            await responseInscripciones.json();

            window.actividadesOriginales =
                actividades;

            window.inscripcionesOriginales =
                inscripciones;

        contenido.innerHTML = `

            <div class="filtros-actividades">

                <select id="filtroCampana">
                    <option value="">
                        Todas las campañas
                    </option>
                </select>

                <select id="filtroEstado">
                    <option value="">
                        Todos los estados
                    </option>
                </select>

                <select id="filtroUbicacion">
                    <option value="">
                        Todas las ubicaciones
                    </option>
                </select>

            </div>

            <div class="module-header">

                <h2>
                    Actividades Disponibles
                </h2>

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

                <tbody id="tbodyActividades">

                    ${actividades.map(
                        actividad => {

                            const inscripcionUsuario =
                                inscripciones.find(

                                    inscripcion =>

                                        inscripcion.id_usuario ==
                                            usuario.id_usuario

                                        &&

                                        inscripcion.id_actividad ==
                                            actividad.id_actividad

                                );

                            const yaInscripto =

                                inscripcionUsuario &&
                                inscripcionUsuario.estado ===
                                "activa";

                            return `

                                <tr>

                                    <td>
                                        ${actividad.nombre}
                                    </td>

                                    <td>
                                        ${actividad.campana}
                                    </td>

                                    <td>
                                        📅 ${formatearFecha(
                                            actividad.fecha
                                        )}
                                    </td>

                                    <td>
                                        ${actividad.ubicacion}
                                    </td>

                                    <td>
                                        ${actividad.cupos}
                                    </td>

                                    <td>
                                        ${actividad.estado}
                                    </td>

                                    <td>

                                        ${
                                            yaInscripto

                                            ?

                                            `

                                            <button
                                                class="btn-inscripto"
                                                disabled
                                            >
                                                Inscripto
                                            </button>

                                            <button
                                                class="btn-comentario"
                                                onclick="abrirComentario(
                                                    ${actividad.id_actividad}
                                                )"
                                            >
                                                Comentar
                                            </button>

                                            `

                                            :

                                            `

                                            <button
                                                class="btn-estado"
                                                onclick="inscribirseActividad(
                                                    ${actividad.id_actividad}
                                                )"
                                            >
                                                ${

                                                    inscripcionUsuario &&
                                                    inscripcionUsuario.estado ===
                                                    "cancelada"

                                                    ?

                                                    "Reinscribirme"

                                                    :

                                                    "Inscribirme"

                                                }

                                            </button>

                                            `
                                        }

                                    </td>

                                </tr>

                            `;

                        }

                    ).join("")}

                </tbody>

            </table>

        `;

        const campanas = [

            ...new Set(

                actividades.map(
                    a => a.campana
                )

            )

        ];

        const estados = [

            ...new Set(

                actividades.map(
                    a => a.estado
                )

            )

        ];

        const ubicaciones = [

            ...new Set(

                actividades.map(
                    a => a.ubicacion
                )

            )

        ];

        document.getElementById(
            "filtroCampana"
        ).innerHTML += campanas.map(

            c => `
                <option value="${c}">
                    ${c}
                </option>
            `

        ).join("");

        document.getElementById(
            "filtroEstado"
        ).innerHTML += estados.map(

            e => `
                <option value="${e}">
                    ${e}
                </option>
            `

        ).join("");

        document.getElementById(
            "filtroUbicacion"
        ).innerHTML += ubicaciones.map(

            u => `
                <option value="${u}">
                    ${u}
                </option>
            `

        ).join("");

        renderizarTablaActividades(
            actividades,
            inscripciones,
            usuario
        );

        function filtrarActividades() {

            const campana =
                document.getElementById(
                    "filtroCampana"
                ).value;

            const estado =
                document.getElementById(
                    "filtroEstado"
                ).value;

            const ubicacion =
                document.getElementById(
                    "filtroUbicacion"
                ).value;

            const usuario =
                JSON.parse(
                    localStorage.getItem(
                        "usuario"
                    )
                );

            const filtradas =
                window.actividadesOriginales.filter(
                    actividad => {

                        return (

                            (!campana ||
                                actividad.campana === campana)

                            &&

                            (!estado ||
                                actividad.estado === estado)

                            &&

                            (!ubicacion ||
                                actividad.ubicacion === ubicacion)

                        );

                    }
                );

            renderizarTablaActividades(
                filtradas,
                window.inscripcionesOriginales,
                usuario
            );

        }

        document.getElementById(
            "filtroCampana"
        ).addEventListener(
            "change",
            filtrarActividades
        );

        document.getElementById(
            "filtroEstado"
        ).addEventListener(
            "change",
            filtrarActividades
        );

        document.getElementById(
            "filtroUbicacion"
        ).addEventListener(
            "change",
            filtrarActividades
        );

    } catch (error) {

        console.error(error);

        contenido.innerHTML = `
            Error cargando actividades
        `;

    }

}

function renderizarTablaActividades(
    actividades,
    inscripciones,
    usuario
) {

    const tbody =
        document.getElementById(
            "tbodyActividades"
        );

    tbody.innerHTML = actividades.map(
        actividad => {

            const inscripcionUsuario =
                inscripciones.find(

                    inscripcion =>

                        inscripcion.id_usuario ==
                        usuario.id_usuario

                        &&

                        inscripcion.id_actividad ==
                        actividad.id_actividad

                );

            const yaInscripto =

                inscripcionUsuario &&
                inscripcionUsuario.estado ===
                "activa";

            return `

                <tr>

                    <td>${actividad.nombre}</td>

                    <td>${actividad.campana}</td>

                    <td>
                        📅 ${formatearFecha(
                            actividad.fecha
                        )}
                    </td>

                    <td>${actividad.ubicacion}</td>

                    <td>${actividad.cupos}</td>

                    <td>${actividad.estado}</td>

                    <td>

                        ${
                            yaInscripto

                            ?

                            `

                            <button
                                class="btn-inscripto"
                                disabled
                            >
                                Inscripto
                            </button>

                            <button
                                class="btn-comentario"
                                onclick="abrirComentario(
                                    ${actividad.id_actividad}
                                )"
                            >
                                Comentar
                            </button>

                            `

                            :

                            `

                            <button
                                class="btn-estado"
                                onclick="inscribirseActividad(
                                    ${actividad.id_actividad}
                                )"
                            >
                                ${
                                    inscripcionUsuario &&
                                    inscripcionUsuario.estado ===
                                    "cancelada"

                                    ?

                                    "Reinscribirme"

                                    :

                                    "Inscribirme"
                                }
                            </button>

                            `
                        }

                    </td>

                </tr>

            `;

        }

    ).join("");

}


// =========================
// INSCRIPCIONES
// =========================

async function mostrarMisInscripciones() {

    activarMenu(
        "menuInscripciones"
    );

    const contenido =
        document.getElementById(
            "contenidoVoluntario"
        );

    const usuario =
        JSON.parse(
            localStorage.getItem(
                "usuario"
            )
        );

    try {

        const response =
            await fetch(
                "http://localhost:3000/inscripciones"
            );

        const inscripciones =
            await response.json();

        const misInscripciones =
            inscripciones.filter(

                inscripcion =>

                    inscripcion.id_usuario ==
                    usuario.id_usuario

            );

        contenido.innerHTML = `

            <div class="module-header">

                <h2>
                    Mis Inscripciones
                </h2>

            </div>

            <div class="filtros-inscripciones">

                <select id="filtroEstadoInscripcion">

                    <option value="">
                        Todos los estados
                    </option>

                </select>

                <select id="filtroCampanaInscripcion">

                    <option value="">
                        Todas las campañas
                    </option>

                </select>

            </div>

            <table class="usuarios-table">

                <thead>

                    <tr>

                        <th>Actividad</th>
                        <th>Campaña</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>

                    </tr>

                </thead>

                <tbody id="tbodyInscripciones">

                </tbody>

            </table>

        `;

        // GUARDAR DATOS ORIGINALES

        window.misInscripcionesOriginales =
            misInscripciones;

        // CARGAR FILTROS

        const estados = [

            ...new Set(

                misInscripciones.map(
                    i => i.estado
                )

            )

        ];

        const campanas = [

            ...new Set(

                misInscripciones.map(
                    i => i.campana
                )

            )

        ];

        document.getElementById(
            "filtroEstadoInscripcion"
        ).innerHTML += estados.map(

            estado => `

                <option value="${estado}">
                    ${estado}
                </option>

            `

        ).join("");

        document.getElementById(
            "filtroCampanaInscripcion"
        ).innerHTML += campanas.map(

            campana => `

                <option value="${campana}">
                    ${campana}
                </option>

            `

        ).join("");
 
        // EVENTOS

        document.getElementById(
            "filtroEstadoInscripcion"
        ).addEventListener(
            "change",
            filtrarInscripciones
        );

        document.getElementById(
            "filtroCampanaInscripcion"
        ).addEventListener(
            "change",
            filtrarInscripciones
        );

        // PRIMER RENDER

        renderizarTablaInscripciones(
            misInscripciones
        );

    } catch (error) {

        console.error(error);

        contenido.innerHTML =
            "Error cargando inscripciones";

    }

}

function renderizarTablaInscripciones(
    inscripciones
) {

    document.getElementById(
        "tbodyInscripciones"
    ).innerHTML = inscripciones.map(

        inscripcion => `

            <tr>

                <td>
                    ${inscripcion.actividad}
                </td>

                <td>
                    ${inscripcion.campana}
                </td>

                <td>
                    📅 ${formatearFecha(
                        inscripcion.fecha
                    )}
                </td>

                <td>
                    ${inscripcion.estado}
                </td>

                <td>

                    ${
                        inscripcion.estado === "cancelada"

                        ?

                        `

                        <button
                            class="btn-cancelado"
                            disabled
                        >
                            Cancelado
                        </button>

                        `

                        :

                        `

                        <button
                            class="btn-delete"
                            onclick="cancelarInscripcion(
                                ${inscripcion.id_inscripcion}
                            )"
                        >
                            Cancelar
                        </button>

                        `

                    }

                </td>

            </tr>

        `

    ).join("");

}

function filtrarInscripciones() {

    const estado =
        document.getElementById(
            "filtroEstadoInscripcion"
        ).value;

    const campana =
        document.getElementById(
            "filtroCampanaInscripcion"
        ).value;

    const resultado =
        window.misInscripcionesOriginales.filter(

            inscripcion =>

                (

                    !estado ||

                    inscripcion.estado ===
                    estado

                )

                &&

                (

                    !campana ||

                    inscripcion.campana ===
                    campana

                )

        );

    renderizarTablaInscripciones(
        resultado
    );

}

// =========================
// CANCELAR INSCRIPCIÓN
// =========================

async function cancelarInscripcion(
    idInscripcion
) {

    const confirmar =
        confirm(

            "¿Cancelar inscripción?"

        );

    if (!confirmar) return;

    try {

        const response = await fetch(

            `http://localhost:3000/inscripciones/${idInscripcion}/cancelar`,

            {

                method: "PUT"

            }

        );

        const data =
            await response.json();

        alert(data.message);

        mostrarMisInscripciones();

    } catch (error) {

        console.error(error);

        alert(
            "Error cancelando inscripción"
        );

    }

}


// =========================
// CARGA INICIAL
// =========================

mostrarInicioVoluntario();

activarMenu(
    "menuInicio"
);

//INSCRIBIRSE
async function inscribirseActividad(
    idActividad
) {

    const usuario =
        JSON.parse(
            localStorage.getItem(
                "usuario"
            )
        );

    try {

        const response =
            await fetch(

                "http://localhost:3000/inscripciones",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        id_usuario:
                            usuario.id_usuario,

                        id_actividad:
                            idActividad

                    })

                }

            );

        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;

        }

        alert(data.message);

        mostrarActividadesDisponibles();

    } catch (error) {

        console.error(error);

        alert(
            "Error al inscribirse"
        );

    }

}

//AGREGAR UN COMENTARIO

async function abrirComentario(
    idActividad
) {

    const comentario =
        prompt(
            "Escribe tu comentario:"
        );

    if (!comentario) return;

    const usuario =
        JSON.parse(
            localStorage.getItem(
                "usuario"
            )
        );

    try {

        const response =
            await fetch(

                "http://localhost:3000/comentarios",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        id_usuario:
                            usuario.id_usuario,

                        id_actividad:
                            idActividad,

                        comentario

                    })

                }

            );

            const data =
                await response.json();

            if (!response.ok) {

                alert(data.message);

                return;

            }

            alert(data.message);

    } catch (error) {

        console.error(error);

        alert(
            "Error agregando comentario"
        );

    }

}

function activarMenu(idMenu) {

    document

        .querySelectorAll(
            ".sidebar-menu a"
        )

        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });

    document

        .getElementById(idMenu)

        .classList.add(
            "active"
        );

}


function mostrarPerfil() {

    activarMenu(
        "menuPerfil"
    );

    const usuario = JSON.parse(
        localStorage.getItem(
            "usuario"
        )
    );

    document.getElementById(
        "contenidoVoluntario"
    ).innerHTML = `

        <div class="module-card">

            <h2>
                Mi Perfil
            </h2>

            <p class="module-subtitle">
                Gestiona tu información personal.
            </p>

            <div class="perfil-layout">

                <!-- COLUMNA IZQUIERDA -->

                <div class="perfil-columna">

                    <h3>
                        Información Personal
                    </h3>

                    <div class="perfil-item">

                        <label>Nombre</label>

                        <div class="perfil-row">

                            <span data-campo="nombre">
                                ${usuario.nombre}
                            </span>

                            <button
                                class="btn-edit"
                                onclick="editarCampo('nombre')"
                            >
                                ✏️
                            </button>

                        </div>

                    </div>

                    <div class="perfil-item">

                        <label>Apellido</label>

                        <div class="perfil-row">

                            <span data-campo="apellido">
                                ${usuario.apellido}
                            </span>

                            <button
                                class="btn-edit"
                                onclick="editarCampo('apellido')"
                            >
                                ✏️
                            </button>

                        </div>

                    </div>

                    <div class="perfil-item">

                        <label>Email</label>

                        <div class="perfil-row">

                            <span data-campo="email">
                                ${usuario.email}
                            </span>

                            <button
                                class="btn-edit"
                                onclick="editarCampo('email')"
                            >
                                ✏️
                            </button>

                        </div>

                    </div>

                </div>

                <!-- COLUMNA DERECHA -->

                <div class="perfil-columna">

                    <h3>
                        Información del Sistema
                    </h3>

                    <div class="perfil-item">

                        <label>Usuario</label>

                        <span>
                            ${usuario.username}
                        </span>

                    </div>

                    <div class="perfil-item">

                        <label>Rol</label>

                        <span>
                            ${usuario.rol}
                        </span>

                    </div>

                    <div class="perfil-item">

                        <label>Estado</label>

                        <span class="estado-activo">
                            ${usuario.estado}
                        </span>

                    </div>

                </div>

            </div>

            <div class="password-section">

                <h3>
                    Cambiar Contraseña
                </h3>

                <div class="password-grid">

                    <input
                        type="password"
                        id="passwordActual"
                        placeholder="Contraseña actual"
                    >

                    <input
                        type="password"
                        id="passwordNueva"
                        placeholder="Nueva contraseña"
                    >

                    <input
                        type="password"
                        id="passwordConfirmar"
                        placeholder="Confirmar contraseña"
                    >

                </div>

                <button
                    class="btn-primary"
                    onclick="cambiarPassword()"
                >
                    Guardar Contraseña
                </button>

            </div>

            <div id="estadisticasPerfil">

            </div>

        </div>

    `;

    cargarEstadisticasPerfil();

}



function editarCampo(campo) {

    const usuario = JSON.parse(
        localStorage.getItem("usuario")
    );

    const span = document.querySelector(
        `[data-campo="${campo}"]`
    );

    if (!span) return;

    span.parentElement.innerHTML = `

        <input
            type="text"
            id="input_${campo}"
            value="${usuario[campo]}"
            class="perfil-input-edit"
        >

        <button
            class="btn-save-inline"
            onclick="guardarCampoInline('${campo}')"
        >
            ✓
        </button>

        <button
            class="btn-cancel-inline"
            onclick="mostrarPerfil()"
        >
            ✕
        </button>

    `;

}


async function guardarCampo(
    campo,
    valor
) {

    const usuario = JSON.parse(

        localStorage.getItem(
            "usuario"
        )

    );

    usuario[campo] = valor;

    try {

        const response = await fetch(

            `http://localhost:3000/perfil/${usuario.id_usuario}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    nombre:
                        usuario.nombre,

                    apellido:
                        usuario.apellido,

                    email:
                        usuario.email

                })

            }

        );

        const data =
            await response.json();

        if (response.ok) {

            localStorage.setItem(

                "usuario",

                JSON.stringify(
                    usuario
                )

            );

            mostrarPerfil();

            alert(
                "Perfil actualizado correctamente"
            );

        } else {

            alert(
                data.message
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "Error actualizando perfil"
        );

    }

}

async function guardarCampoInline(
    campo
) {

    const valor = document
        .getElementById(
            `input_${campo}`
        )
        .value
        .trim();

    if (!valor) {

        alert(
            "Ingrese un valor"
        );

        return;

    }

    await guardarCampo(
        campo,
        valor
    );

}


async function cargarEstadisticasPerfil() {

    const usuario = JSON.parse(

        localStorage.getItem(
            "usuario"
        )

    );

    const response = await fetch(

        `http://localhost:3000/perfil/${usuario.id_usuario}/estadisticas`

    );

    const data = await response.json();

    document.getElementById(

        "estadisticasPerfil"

    ).innerHTML = `

        <div class="stats-grid">

            <div class="stat-card">

                <h3>
                    ${data.total}
                </h3>

                <p>
                    Inscripciones
                </p>

            </div>

            <div class="stat-card">

                <h3>
                    ${data.activas}
                </h3>

                <p>
                    Activas
                </p>

            </div>

            <div class="stat-card">

                <h3>
                    ${data.canceladas}
                </h3>

                <p>
                    Canceladas
                </p>

            </div>

        </div>

    `;

}

function editarPerfil() {

    alert(
        "Próximamente edición de perfil"
    );

}

async function cambiarPassword() {

    const passwordActual =

        document.getElementById(
            "passwordActual"
        ).value.trim();

    const passwordNueva =

        document.getElementById(
            "passwordNueva"
        ).value.trim();

    const passwordConfirmar =

        document.getElementById(
            "passwordConfirmar"
        ).value.trim();

    if (

        !passwordActual ||

        !passwordNueva ||

        !passwordConfirmar

    ) {

        alert(
            "Complete todos los campos"
        );

        return;

    }

    if (

        passwordNueva !==
        passwordConfirmar

    ) {

        alert(
            "Las contraseñas no coinciden"
        );

        return;

    }

    if (

        passwordActual ===
        passwordNueva

    ) {

        alert(
            "La nueva contraseña debe ser diferente"
        );

        return;

    }

    const usuario = JSON.parse(

        localStorage.getItem(
            "usuario"
        )

    );

    try {

        const response = await fetch(

            `http://localhost:3000/perfil/${usuario.id_usuario}/password`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    passwordActual,

                    passwordNueva

                })

            }

        );

        const data =
            await response.json();

        if (response.ok) {

            alert(
                data.message
            );

            document.getElementById(
                "passwordActual"
            ).value = "";

            document.getElementById(
                "passwordNueva"
            ).value = "";

            document.getElementById(
                "passwordConfirmar"
            ).value = "";

        } else {

            alert(
                data.message
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "Error actualizando contraseña"
        );

    }

}

function filtrarActividades() {

    const campana =
        document.getElementById(
            "filtroCampana"
        ).value;

    const estado =
        document.getElementById(
            "filtroEstado"
        ).value;

    const ubicacion =
        document.getElementById(
            "filtroUbicacion"
        ).value;

    const usuario =
        JSON.parse(
            localStorage.getItem(
                "usuario"
            )
        );

    const filtradas =
        window.actividadesOriginales.filter(
            actividad => {

                return (

                    (!campana ||
                        actividad.campana === campana)

                    &&

                    (!estado ||
                        actividad.estado === estado)

                    &&

                    (!ubicacion ||
                        actividad.ubicacion === ubicacion)

                );

            }
        );

    renderizarTablaActividades(
        filtradas,
        window.inscripcionesOriginales,
        usuario
    );

}