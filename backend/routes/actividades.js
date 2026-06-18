const express = require('express');
const router = express.Router();
const pool = require('../db');


// =========================
// CREAR ACTIVIDAD
// =========================

router.post('/', async (req, res) => {

    const {

        nombre,
        descripcion,
        fecha,
        ubicacion,
        cupos,
        estado,
        id_campana,
        id_usuario_creador

    } = req.body;

    try {

        const campanaDB = await pool.query(

            `SELECT *
             FROM campana
             WHERE id_campana = $1`,

            [id_campana]

        );

        if (campanaDB.rows.length === 0) {

            return res.status(404).json({

                message:
                    "Campaña no encontrada"

            });

        }

        const campana =
            campanaDB.rows[0];

        if (campana.estado !== "activa") {

            return res.status(400).json({

                message:
                    "La campaña está finalizada"

            });

        }

        // =========================
        // CONFIGURACION SISTEMA
        // =========================

        const configDB =
            await pool.query(

                `SELECT *
                FROM configuracion_sistema
                LIMIT 1`

            );

        const config =
            configDB.rows[0];

        if (cupos > config.cupos_default) {

            return res.status(400).json({

                message:
                    `No se permiten más de ${config.cupos_default} cupos`

            });

        }


        const cuposFinal =

            cupos && cupos > 0

            ? cupos

            : config.cupos_default;


        const result = await pool.query(

            `INSERT INTO actividad (

                nombre,
                descripcion,
                fecha,
                ubicacion,
                cupos,
                estado,
                id_campana,
                id_usuario_creador

            )

            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)

            RETURNING *`,

            [

                nombre,
                descripcion,
                fecha,
                ubicacion,
                cuposFinal,
                estado,
                id_campana,
                id_usuario_creador

            ]

        );

        res.json({

            message:
                "Actividad creada correctamente",

            actividad:
                result.rows[0]

        });

    } catch (error) {

        console.error("ERROR ACTIVIDAD:");
        console.error(error);

        res.status(500).json({

            message:
                "Error creando actividad"

        });

    }

});


// =========================
// LISTAR ACTIVIDADES
// =========================

router.get('/', async (req, res) => {

    try {

        const configDB =
            await pool.query(
                `SELECT *
                 FROM configuracion_sistema
                 LIMIT 1`
            );

        const config =
            configDB.rows[0];

        let query = `

            SELECT

                a.*,

                c.nombre AS campana,

                u.nombre AS creador

            FROM actividad a

            LEFT JOIN campana c
            ON a.id_campana = c.id_campana

            LEFT JOIN usuario u
            ON a.id_usuario_creador = u.id_usuario

        `;

        if (!config.mostrar_finalizadas) {

            query += `
                WHERE a.estado <> 'finalizada'
            `;

        }

        query += `
            ORDER BY a.id_actividad DESC
        `;

        const result =
            await pool.query(query);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error cargando actividades"
        });

    }

});

// =========================
// EDITAR ACTIVIDAD
// =========================

router.put('/:id', async (req, res) => {

    const { id } = req.params;

    const {

        nombre,
        descripcion,
        fecha,
        ubicacion,
        cupos,
        estado,
        id_campana,
        usuarioLogueado

    } = req.body;

    try {

        // =========================
        // ACTIVIDAD
        // =========================

        const actividadDB = await pool.query(

            `
            SELECT *
            FROM actividad
            WHERE id_actividad = $1
            `,

            [id]

        );

        if (actividadDB.rows.length === 0) {

            return res.status(404).json({

                message:
                    "Actividad no encontrada"

            });

        }

        const actividad =
            actividadDB.rows[0];

        // =========================
        // NO EDITAR FINALIZADAS
        // =========================

        if (actividad.estado === "finalizada") {

            return res.status(400).json({

                message:
                    "La actividad está finalizada"

            });

        }

        // =========================
        // PERMISOS
        // =========================

        if (

            usuarioLogueado.rol === "coordinador"
            &&
            actividad.id_usuario_creador !== usuarioLogueado.id_usuario

        ) {

            return res.status(403).json({

                message:
                    "No autorizado"

            });

        }

        // =========================
        // UPDATE
        // =========================

        await pool.query(

            `
            UPDATE actividad

            SET

                nombre = $1,
                descripcion = $2,
                fecha = $3,
                ubicacion = $4,
                cupos = $5,
                estado = $6,
                id_campana = $7

            WHERE id_actividad = $8
            `,

            [

                nombre,
                descripcion,
                fecha,
                ubicacion,
                cupos,
                estado,
                id_campana,
                id

            ]

        );

        res.json({

            message:
                "Actividad actualizada"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error actualizando actividad"

        });

    }

});


// =========================
// ELIMINAR ACTIVIDAD
// =========================

router.delete('/:id', async (req, res) => {

    const { id } = req.params;

    try {

        await pool.query(

            `
            DELETE FROM actividad
            WHERE id_actividad = $1
            `,

            [id]

        );

        res.json({

            message:
                "Actividad eliminada"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error eliminando actividad"

        });

    }

});

// =========================
// CAMBIAR ESTADO ACTIVIDAD
// =========================

router.put('/:id/estado', async (req, res) => {

    const { id } = req.params;

    const {

        estado,
        usuarioLogueado

    } = req.body;

    try {

        // =========================
        // ACTIVIDAD
        // =========================

        const actividadDB = await pool.query(

            `
            SELECT *
            FROM actividad
            WHERE id_actividad = $1
            `,

            [id]

        );

        if (actividadDB.rows.length === 0) {

            return res.status(404).json({

                message:
                    "Actividad no encontrada"

            });

        }

        const actividad =
            actividadDB.rows[0];

        // =========================
        // PERMISOS
        // =========================

        if (

            usuarioLogueado.rol ===
            "coordinador"

            &&

            actividad.id_usuario_creador
            !== usuarioLogueado.id_usuario

        ) {

            return res.status(403).json({

                message:
                    "No autorizado"

            });

        }

        // =========================
        // UPDATE
        // =========================

        await pool.query(

            `
            UPDATE actividad

            SET estado = $1

            WHERE id_actividad = $2
            `,

            [

                estado,
                id

            ]

        );

        res.json({

            message:
                "Estado actualizado"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error actualizando estado"

        });

    }

});

// =========================
// EXPORT
// =========================

module.exports = router;