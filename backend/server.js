const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const pool = require('./db');


// =============================
// TEST SERVIDOR
// =============================

app.get('/', (req, res) => {

    res.send('Servidor VoluntApp funcionando 🚀');

});

app.get('/test-db', async (req, res) => {

    try {

        const result =
            await pool.query('SELECT NOW()');

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).send(error.message);

    }

});


// =============================
// LOGIN
// =============================

app.post('/login', async (req, res) => {

    const { login, password } = req.body;

    try {

        const result = await pool.query(

            `SELECT *
             FROM usuario
             WHERE (email = $1 OR username = $1)
             AND password = $2`,

            [login, password]

        );

        if (result.rows.length > 0) {

            const user = result.rows[0];

            if (user.estado === "inactivo") {

                return res.status(403).json({

                    message:
                        "Tu cuenta está desactivada"

                });

            }

            res.json({

                message: 'Login exitoso',

                user: {

                    id_usuario:
                        user.id_usuario,

                    nombre:
                        user.nombre,

                    apellido:
                        user.apellido,

                    username:
                        user.username,

                    email:
                        user.email,

                    rol:
                        user.rol,

                    estado:
                        user.estado

                }

            });

        } else {

            res.status(401).json({

                message:
                    'Credenciales incorrectas'

            });

        }

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                'Error en servidor'

        });

    }

});

// =============================
// SOLICITAR REACTIVACION
// =============================

app.post(
    '/solicitar-reactivacion',
    async (req, res) => {

        const { login } = req.body;

        try {

            const usuarioDB =
                await pool.query(

                    `
                    SELECT *
                    FROM usuario
                    WHERE email = $1
                    OR username = $1
                    `,
                    [login]

                );

            if (
                usuarioDB.rows.length === 0
            ) {

                return res.status(404).json({

                    message:
                        'Usuario no encontrado'

                });

            }

            const usuario =
                usuarioDB.rows[0];

            const existe =
                await pool.query(

                    `
                    SELECT *
                    FROM solicitud_reactivacion

                    WHERE id_usuario = $1

                    AND estado = 'pendiente'
                    `,

                    [usuario.id_usuario]

                );

            if (
                existe.rows.length > 0
            ) {

                return res.status(400).json({

                    message:
                        'Ya existe una solicitud pendiente'

                });

            }

            await pool.query(

                `
                INSERT INTO solicitud_reactivacion
                (
                    id_usuario
                )

                VALUES
                (
                    $1
                )
                `,

                [usuario.id_usuario]

            );

            res.json({

                message:
                    'Solicitud enviada'

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    'Error enviando solicitud'

            });

        }

    }
);

// =============================
// LISTAR SOLICITUDES
// =============================

app.get(
    '/solicitudes-reactivacion',
    async (req, res) => {

        try {

            const result =
                await pool.query(

                    `
                    SELECT

                        sr.*,

                        u.nombre,
                        u.apellido,
                        u.username

                    FROM solicitud_reactivacion sr

                    INNER JOIN usuario u

                    ON sr.id_usuario = u.id_usuario

                    WHERE sr.estado = 'pendiente'

                    ORDER BY sr.id_solicitud DESC
                    `

                );

            res.json(
                result.rows
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    'Error cargando solicitudes'

            });

        }

    }
);

// =============================
// APROBAR SOLICITUD
// =============================

app.put(
    '/solicitudes-reactivacion/:id/aprobar',
    async (req, res) => {

        const { id } =
            req.params;

        try {

            const solicitud =
                await pool.query(

                    `
                    SELECT *
                    FROM solicitud_reactivacion
                    WHERE id_solicitud = $1
                    `,

                    [id]

                );

            if (
                solicitud.rows.length === 0
            ) {

                return res.status(404).json({

                    message:
                        'Solicitud no encontrada'

                });

            }

            const usuarioId =
                solicitud.rows[0]
                    .id_usuario;

            await pool.query(

                `
                UPDATE usuario

                SET estado = 'activo'

                WHERE id_usuario = $1
                `,

                [usuarioId]

            );

            await pool.query(

                `
                UPDATE solicitud_reactivacion

                SET

                    estado = 'aprobada',
                    fecha_respuesta = NOW()

                WHERE id_solicitud = $1
                `,

                [id]

            );

            res.json({

                message:
                    'Usuario reactivado'

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    'Error aprobando'

            });

        }

    }
);

// =============================
// RECHAZAR SOLICITUD
// =============================

app.put(
    '/solicitudes-reactivacion/:id/rechazar',
    async (req, res) => {

        const { id } =
            req.params;

        try {

            await pool.query(

                `
                UPDATE solicitud_reactivacion

                SET

                    estado = 'rechazada',
                    fecha_respuesta = NOW()

                WHERE id_solicitud = $1
                `,

                [id]

            );

            res.json({

                message:
                    'Solicitud rechazada'

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    'Error rechazando'

            });

        }

    }
);

// =============================
// VOLUNTARIOS
// =============================

app.post('/voluntarios', async (req, res) => {

    const {

        nombre,
        telefono,
        direccion,
        id_usuario

    } = req.body;

    try {

        const result = await pool.query(

            `INSERT INTO voluntario
            (
                nombre,
                telefono,
                direccion,
                id_usuario
            )

            VALUES
            (
                $1, $2, $3, $4
            )

            RETURNING *`,

            [
                nombre,
                telefono,
                direccion,
                id_usuario
            ]

        );

        res.json({

            message:
                'Voluntario creado correctamente',

            voluntario:
                result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).send(error.message);

    }

});


app.get('/voluntarios', async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT *
             FROM voluntario
             ORDER BY id_voluntario ASC`

        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).send(error.message);

    }

});


app.put('/voluntarios/:id', async (req, res) => {

    const { id } = req.params;

    const {

        nombre,
        telefono,
        direccion

    } = req.body;

    try {

        const result = await pool.query(

            `UPDATE voluntario

             SET
                nombre = $1,
                telefono = $2,
                direccion = $3

             WHERE id_voluntario = $4

             RETURNING *`,

            [
                nombre,
                telefono,
                direccion,
                id
            ]

        );

        if (result.rows.length > 0) {

            res.json({

                message:
                    'Voluntario actualizado correctamente',

                voluntario:
                    result.rows[0]

            });

        } else {

            res.status(404).json({

                message:
                    'Voluntario no encontrado'

            });

        }

    } catch (error) {

        console.error(error);

        res.status(500).send(error.message);

    }

});


// =============================
// USUARIOS
// =============================

app.get('/usuarios', async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT
                id_usuario,
                nombre,
                apellido,
                username,
                email,
                rol,
                estado
             FROM usuario
             ORDER BY id_usuario ASC`

        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                'Error obteniendo usuarios'

        });

    }

});


// =============================
// CREAR USUARIO
// =============================

app.post('/usuarios', async (req, res) => {

    const {

        nombre,
        apellido,
        username,
        email,
        password,
        rol,
        usuarioLogueado

    } = req.body;

    try {

        // =============================
        // CONFIGURACION SISTEMA
        // =============================

        const configDB = await pool.query(
            `
            SELECT *
            FROM configuracion_sistema
            LIMIT 1
            `
        );

        const config = configDB.rows[0];

        if (!config.permitir_registro) {

            return res.status(403).json({

                message:
                    "El registro de usuarios está deshabilitado"

            });

        }

        // =============================
        // VALIDAR ROLES
        // =============================

        if (

            usuarioLogueado?.rol === "coordinador"
            &&
            rol !== "voluntario"

        ) {

            return res.status(403).json({

                message:
                    "No autorizado"

            });

        }


        // =============================
        // VALIDAR USERNAME
        // =============================

        const existe = await pool.query(

            `SELECT *
             FROM usuario
             WHERE username = $1`,

            [username]

        );

        if (existe.rows.length > 0) {

            return res.status(400).json({

                message:
                    'El username ya existe'

            });

        }
        

        // =============================
        // INSERTAR USUARIO
        // =============================


        const result = await pool.query(

            `INSERT INTO usuario
            (
                nombre,
                apellido,
                username,
                email,
                password,
                rol,
                estado
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,'activo'
            )

            RETURNING *`,

            [
                nombre,
                apellido,
                username,
                email,
                password,
                rol
            ]

        );

        res.json({

            message:
                'Usuario creado correctamente',

            usuario:
                result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                'Error creando usuario'

        });

    }

});


// =============================
// EDITAR USUARIO
// =============================

app.put('/usuarios/:id', async (req, res) => {

    const { id } = req.params;

    const {

        nombre,
        apellido,
        username,
        email,
        password,
        rol,
        usuarioLogueado

    } = req.body;

    try {

        // =============================
        // OBTENER USUARIO OBJETIVO
        // =============================

        const usuarioDB = await pool.query(

            `SELECT *
             FROM usuario
             WHERE id_usuario = $1`,

            [id]

        );

        if (usuarioDB.rows.length === 0) {

            return res.status(404).json({

                message:
                    'Usuario no encontrado'

            });

        }

        const usuarioObjetivo =
            usuarioDB.rows[0];


        // =============================
        // VALIDAR PERMISOS
        // =============================

        if (

            usuarioLogueado?.rol === "coordinador"
            &&
            usuarioObjetivo.rol !== "voluntario"

        ) {

            return res.status(403).json({

                message:
                    'No autorizado'

            });

        }


        // =============================
        // VALIDAR USERNAME DUPLICADO
        // =============================

        const usernameExiste =
            await pool.query(

                `
                SELECT *
                FROM usuario
                WHERE username = $1
                AND id_usuario != $2
                `,

                [username, id]

            );

        if (usernameExiste.rows.length > 0) {

            return res.status(400).json({

                message:
                    'El username ya existe'

            });

        }


        // =============================
        // VALIDAR EMAIL DUPLICADO
        // =============================

        const emailExiste =
            await pool.query(

                `
                SELECT *
                FROM usuario
                WHERE email = $1
                AND id_usuario != $2
                `,

                [email, id]

            );

        if (emailExiste.rows.length > 0) {

            return res.status(400).json({

                message:
                    'El email ya existe'

            });

        }


        // =============================
        // ACTUALIZAR
        // =============================

        if (password) {

            await pool.query(

                `UPDATE usuario

                 SET
                    nombre = $1,
                    apellido = $2,
                    username = $3,
                    email = $4,
                    password = $5,
                    rol = $6

                 WHERE id_usuario = $7`,

                [
                    nombre,
                    apellido,
                    username,
                    email,
                    password,
                    rol,
                    id
                ]

            );

        } else {

            await pool.query(

                `UPDATE usuario

                 SET
                    nombre = $1,
                    apellido = $2,
                    username = $3,
                    email = $4,
                    rol = $5

                 WHERE id_usuario = $6`,

                [
                    nombre,
                    apellido,
                    username,
                    email,
                    rol,
                    id
                ]

            );

        }


        res.json({

            message:
                'Usuario actualizado'

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                'Error actualizando usuario'

        });

    }

});


// =============================
// CAMBIAR ESTADO
// =============================

app.put('/usuarios/:id/estado', async (req, res) => {

    const { id } = req.params;

    const {

        estado,
        usuarioLogueado

    } = req.body;

    try {

        // obtener usuario objetivo

        const usuarioDB = await pool.query(

            `SELECT *
             FROM usuario
             WHERE id_usuario = $1`,

            [id]

        );

        if (usuarioDB.rows.length === 0) {

            return res.status(404).json({

                message:
                    'Usuario no encontrado'

            });

        }

        const usuarioObjetivo =
            usuarioDB.rows[0];


        // =============================
        // VALIDAR PERMISOS
        // =============================

        if (

            usuarioLogueado?.rol === "coordinador"
            &&
            usuarioObjetivo.rol !== "voluntario"

        ) {

            return res.status(403).json({

                message:
                    'No autorizado'

            });

        }


        // =============================
        // ACTUALIZAR ESTADO
        // =============================

        const result = await pool.query(

            `UPDATE usuario

             SET estado = $1

             WHERE id_usuario = $2

             RETURNING *`,

            [estado, id]

        );

        res.json({

            message:
                'Estado actualizado',

            usuario:
                result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                'Error actualizando estado'

        });

    }

});

// =========================
// CAMBIAR ESTADO CAMPAÑA
// =========================

app.put('/campanas/:id/estado', async (req, res) => {

    const { id } = req.params;

    const {

        estado,
        usuarioLogueado,
        finalizado_por

    } = req.body;

    try {

        // obtener campaña

        const campanaDB = await pool.query(

            `SELECT *
             FROM campana
             WHERE id_campana = $1`,

            [id]

        );

        if (campanaDB.rows.length === 0) {

            return res.status(404).json({

                message:
                    'Campaña no encontrada'

            });

        }

        const campana =
            campanaDB.rows[0];

        // =========================
        // VALIDAR PERMISOS
        // =========================
        // =========================

        let puedeEditar = false;


        // ADMIN

        if (usuarioLogueado.rol === "admin") {

            puedeEditar = true;

        }


        // COORDINADOR

        else if (

            usuarioLogueado.rol === "coordinador"

        ) {

            // puede manejar solo campañas propias

            if (

                campana.responsable ===
                usuarioLogueado.nombre

            ) {

                // activa

                if (campana.estado === "activa") {

                    puedeEditar = true;

                }

                // finalizada

                else if (

                    campana.estado === "finalizada"

                ) {

                    // solo quien finalizó

                    if (

                        campana.finalizado_por ===
                        usuarioLogueado.nombre

                    ) {

                        puedeEditar = true;

                    }

                }

            }

        }

        if (!puedeEditar) {

            return res.status(403).json({

                message:
                    'No autorizado'

            });

        }
        // =========================
        // ACTUALIZAR ESTADO
        // =========================

        await pool.query(

            `UPDATE campana

            SET

                estado = $1,

                finalizado_por = $2

            WHERE id_campana = $3`,

            [
                estado,
                finalizado_por,
                id
            ]

        );

        res.json({

            message:
                'Estado actualizado'

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                'Error actualizando campaña'

        });

    }

});

app.get(
    '/perfil/:id/estadisticas',

    async (req, res) => {

        const { id } = req.params;

        try {

            const result = await pool.query(

                `
                SELECT

                    COUNT(*) AS total,

                    COUNT(*) FILTER
                    (
                        WHERE estado='activa'
                    ) AS activas,

                    COUNT(*) FILTER
                    (
                        WHERE estado='cancelada'
                    ) AS canceladas

                FROM inscripcion

                WHERE id_usuario = $1
                `,

                [id]

            );

            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Error obteniendo estadísticas"

            });

        }

    }
);

// =============================
// ACTUALIZAR PERFIL VOLUNTARIO
// =============================

app.put(
    '/perfil/:id',

    async (req, res) => {

        const { id } = req.params;

        const {
            nombre,
            apellido,
            email
        } = req.body;

        try {

            await pool.query(

                `UPDATE usuario

                 SET
                    nombre = $1,
                    apellido = $2,
                    email = $3

                 WHERE id_usuario = $4`,

                [
                    nombre,
                    apellido,
                    email,
                    id
                ]

            );

            res.json({

                message:
                    'Perfil actualizado'

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    'Error actualizando perfil'

            });

        }

    }

);

// =============================
// CAMBIAR CONTRASEÑA
// =============================

app.put(
    '/perfil/:id/password',

    async (req, res) => {

        const { id } = req.params;

        const {
            passwordActual,
            passwordNueva
        } = req.body;

        try {

            const usuario = await pool.query(

                `
                SELECT *
                FROM usuario
                WHERE id_usuario = $1
                `,

                [id]

            );

            if (
                usuario.rows.length === 0
            ) {

                return res.status(404).json({

                    message:
                        'Usuario no encontrado'

                });

            }

            if (

                usuario.rows[0].password !==
                passwordActual

            ) {

                return res.status(400).json({

                    message:
                        'La contraseña actual es incorrecta'

                });

            }

            await pool.query(

                `
                UPDATE usuario

                SET password = $1

                WHERE id_usuario = $2
                `,

                [
                    passwordNueva,
                    id
                ]

            );

            res.json({

                message:
                    'Contraseña actualizada correctamente'

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    'Error actualizando contraseña'

            });

        }

    }

);

// =============================
// REPORTE USUARIOS CSV
// =============================

app.get('/reportes/usuarios', async (req, res) => {

    try {

        const result = await pool.query(

            `
            SELECT

                id_usuario,
                nombre,
                apellido,
                username,
                email,
                rol,
                estado

            FROM usuario

            ORDER BY id_usuario
            `

        );

        let csv =

            "ID,Nombre,Apellido,Username,Email,Rol,Estado\n";

        result.rows.forEach(usuario => {

            csv +=

                `${usuario.id_usuario},` +
                `${usuario.nombre},` +
                `${usuario.apellido},` +
                `${usuario.username},` +
                `${usuario.email},` +
                `${usuario.rol},` +
                `${usuario.estado}\n`;

        });

        res.setHeader(

            'Content-Type',
            'text/csv'

        );

        res.setHeader(

            'Content-Disposition',
            'attachment; filename=usuarios.csv'

        );

        res.send(csv);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                'Error generando CSV'

        });

    }

});

// =============================
// REPORTE ACTIVIDADES CSV
// =============================

app.get('/reportes/actividades', async (req, res) => {

    try {

        const result = await pool.query(

            `
            SELECT

                a.id_actividad,
                a.nombre,
                a.fecha,
                a.ubicacion,
                a.cupos,
                a.estado,
                c.nombre AS campana

            FROM actividad a

            LEFT JOIN campana c
            ON a.id_campana = c.id_campana

            ORDER BY a.id_actividad
            `

        );

        let csv =

            "ID,Nombre,Fecha,Ubicacion,Cupos,Estado,Campana\n";

        result.rows.forEach(actividad => {

            csv +=

                `${actividad.id_actividad},` +
                `${actividad.nombre},` +
                `${actividad.fecha},` +
                `${actividad.ubicacion},` +
                `${actividad.cupos},` +
                `${actividad.estado},` +
                `${actividad.campana}\n`;

        });

        res.setHeader(
            'Content-Type',
            'text/csv'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=actividades.csv'
        );

        res.send(csv);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                'Error generando CSV'

        });

    }

});

// =============================
// REPORTE INSCRIPCIONES CSV
// =============================

app.get('/reportes/inscripciones', async (req, res) => {

    try {

        const result = await pool.query(

            `
            SELECT

                i.id_inscripcion,

                u.nombre || ' ' || u.apellido
                AS voluntario,

                a.nombre
                AS actividad,

                i.fecha_inscripcion,

                i.estado

            FROM inscripcion i

            LEFT JOIN usuario u
            ON i.id_usuario = u.id_usuario

            LEFT JOIN actividad a
            ON i.id_actividad = a.id_actividad

            ORDER BY i.id_inscripcion
            `

        );

        let csv =

            "ID,Voluntario,Actividad,Fecha Inscripcion,Estado\n";

        result.rows.forEach(inscripcion => {

            csv +=

                `${inscripcion.id_inscripcion},` +
                `"${inscripcion.voluntario}",` +
                `"${inscripcion.actividad}",` +
                `${inscripcion.fecha_inscripcion},` +
                `${inscripcion.estado}\n`;

        });

        res.setHeader(
            'Content-Type',
            'text/csv'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=inscripciones.csv'
        );

        res.send(csv);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                'Error generando CSV'

        });

    }

});


// =============================
// REPORTE COMENTARIOS CSV
// =============================

app.get('/reportes/comentarios', async (req, res) => {

    try {

        const result = await pool.query(

            `
            SELECT

                c.id_comentario,

                u.nombre || ' ' || u.apellido
                AS usuario,

                a.nombre
                AS actividad,

                c.comentario,

                c.fecha_comentario

            FROM comentario c

            LEFT JOIN usuario u
            ON c.id_usuario = u.id_usuario

            LEFT JOIN actividad a
            ON c.id_actividad = a.id_actividad

            ORDER BY c.id_comentario
            `

        );

        let csv =

            "ID,Usuario,Actividad,Comentario,Fecha\n";

        result.rows.forEach(comentario => {

            const textoLimpio =
                comentario.comentario
                    ?.replace(/,/g, ' ')
                    ?.replace(/\n/g, ' ');

            csv +=

                `${comentario.id_comentario},` +
                `"${comentario.usuario}",` +
                `"${comentario.actividad}",` +
                `"${textoLimpio}",` +
                `${comentario.fecha_comentario}\n`;

        });

        res.setHeader(
            'Content-Type',
            'text/csv'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=comentarios.csv'
        );

        res.send(csv);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                'Error generando CSV'

        });

    }

});

// =============================
// RUTAS EXTERNAS
// =============================

const campanasRoutes =
    require('./routes/campanas');

app.use('/campanas', campanasRoutes);


const actividadesRoutes =
    require('./routes/actividades');

app.use('/actividades', actividadesRoutes);


const inscripcionesRoutes =
    require('./routes/inscripciones');

app.use('/inscripciones', inscripcionesRoutes);


const dashboardRoutes =
    require('./routes/dashboard');

app.use('/dashboard', dashboardRoutes);

const configuracionRoutes =
    require('./routes/configuracion');

app.use(
    '/configuracion',
    configuracionRoutes
);


// =============================
// SERVER
// =============================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Servidor corriendo en http://localhost:${PORT}`
    );

});

const fs = require('fs');

const path = require("path");

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

const comentariosRoutes =
    require('./routes/comentarios');

app.use(
    '/comentarios',
    comentariosRoutes
);