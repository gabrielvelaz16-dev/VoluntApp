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


// =============================
// SERVER
// =============================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Servidor corriendo en http://localhost:${PORT}`
    );

});