const express = require('express');
const router = express.Router();
const pool = require('../db');


// =========================
// INSCRIBIR USUARIO
// =========================

router.post('/', async (req, res) => {

    const {

        id_usuario,
        id_actividad

    } = req.body;

    try {

        // =========================
        // VALIDAR ACTIVIDAD
        // =========================

        const actividadDB = await pool.query(

            `SELECT *
             FROM actividad
             WHERE id_actividad = $1`,

            [id_actividad]

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
        // VALIDAR ESTADO
        // =========================

        if (
            actividad.estado ===
            "finalizada"
        ) {

            return res.status(400).json({

                message:
                    "La actividad está finalizada"

            });

        }

        // =========================
        // VALIDAR CUPOS
        // =========================

        if (actividad.cupos <= 0) {

            return res.status(400).json({

                message:
                    "No hay cupos disponibles"

            });

        }

        // =========================
        // VALIDAR INSCRIPCIÓN DUPLICADA
        // =========================

        const config = await pool.query(
            `SELECT permitir_reinscripciones
            FROM configuracion_sistema
            LIMIT 1`
        );

        const permitirReinscripciones =
            config.rows[0]
                .permitir_reinscripciones;

        // =========================
        // VALIDAR REINSCRIPCIONES
        // =========================

        const inscripcionAnterior =
            await pool.query(

                `SELECT *
                FROM inscripcion
                WHERE id_usuario = $1
                AND id_actividad = $2`,

                [
                    id_usuario,
                    id_actividad
                ]

            );

        if (

            inscripcionAnterior.rows.length > 0

            &&

            !permitirReinscripciones

        ) {

            return res.status(403).json({

                message:
                    "Las reinscripciones están deshabilitadas"

            });

        }

        // =========================
        // CREAR INSCRIPCIÓN
        // =========================

        await pool.query(

            `INSERT INTO inscripcion (

                id_usuario,
                id_actividad,
                estado

            )

            VALUES ($1,$2,'activa')`,

            [
                id_usuario,
                id_actividad
            ]

        );

        const existeInscripcion =
            await pool.query(

                `SELECT *
                 FROM inscripcion
                 WHERE id_usuario = $1
                 AND id_actividad = $2
                 AND estado = 'activa'`,

                [
                    id_usuario,
                    id_actividad
                ]

            );

        if (
            existeInscripcion.rows.length > 0
        ) {

            return res.status(400).json({

                message:
                    "Ya estás inscrito en esta actividad"

            });

        }



        // =========================
        // DESCONTAR CUPO
        // =========================

        await pool.query(

            `UPDATE actividad
             SET cupos = cupos - 1
             WHERE id_actividad = $1`,

            [id_actividad]

        );

        res.json({

            message:
                "Inscripción realizada correctamente"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error al realizar inscripción"

        });

    }

});


// =========================
// LISTAR INSCRIPCIONES
// =========================

router.get('/', async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT

                i.id_inscripcion,
                i.id_usuario,
                i.id_actividad,
                i.fecha_inscripcion,
                i.estado,

                u.nombre || ' ' || u.apellido
                    AS voluntario,

                a.nombre AS actividad,
                a.fecha,
                a.ubicacion,

                c.nombre AS campana

            FROM inscripcion i

            INNER JOIN usuario u
                ON i.id_usuario = u.id_usuario

            INNER JOIN actividad a
                ON i.id_actividad = a.id_actividad

            LEFT JOIN campana c
                ON a.id_campana = c.id_campana

            ORDER BY i.id_inscripcion DESC`

        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error obteniendo inscripciones"

        });

    }

});


// =========================
// MIS INSCRIPCIONES
// =========================

router.get('/usuario/:id', async (req, res) => {

    const { id } = req.params;

    try {

        const result = await pool.query(

            `SELECT

                i.id_inscripcion,
                i.fecha_inscripcion,
                i.estado,

                a.id_actividad,
                a.nombre AS actividad,
                a.descripcion,
                a.fecha,
                a.ubicacion,
                a.estado AS estado_actividad,

                c.nombre AS campana

            FROM inscripcion i

            INNER JOIN actividad a
                ON i.id_actividad = a.id_actividad

            LEFT JOIN campana c
                ON a.id_campana = c.id_campana

            WHERE i.id_usuario = $1

            ORDER BY i.id_inscripcion DESC`,

            [id]

        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error obteniendo mis inscripciones"

        });

    }

});


// =========================
// CANCELAR INSCRIPCIÓN
// =========================

router.put('/:id/cancelar', async (req, res) => {

    const { id } = req.params;

    try {

        // =========================
        // BUSCAR INSCRIPCIÓN
        // =========================

        const inscripcionDB =
            await pool.query(

                `SELECT *
                 FROM inscripcion
                 WHERE id_inscripcion = $1`,

                [id]

            );

        if (
            inscripcionDB.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Inscripción no encontrada"

            });

        }

        const inscripcion =
            inscripcionDB.rows[0];

            if (
                inscripcion.estado ===
                "cancelada"
            ) {

                return res.status(400).json({

                    message:
                        "La inscripción ya está cancelada"

                });

            }

            const actividadDB =
                await pool.query(

                    `SELECT *
                    FROM actividad
                    WHERE id_actividad = $1`,

                    [inscripcion.id_actividad]

                );

            const actividad =
                actividadDB.rows[0];

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

            // =========================
            // VALIDAR DIAS CANCELACION
            // =========================

            const hoy =
                new Date();

            const fechaActividad =
                new Date(
                    actividad.fecha
                );

            const diferenciaDias =
                Math.ceil(

                    (fechaActividad - hoy)

                    /

                    (1000 * 60 * 60 * 24)

                );

            if (

                diferenciaDias <=

                config.dias_cancelacion

            ) {

                return res.status(400).json({

                    message:
                        `Solo puedes cancelar con ${config.dias_cancelacion} días de anticipación`

                });

            }

            if (
                actividad.estado ===
                "finalizada"
            ) {

                return res.status(400).json({

                    message:
                        "No puedes cancelar una actividad finalizada"

                });

            }

        // =========================
        // CANCELAR INSCRIPCIÓN
        // =========================

        await pool.query(

            `UPDATE inscripcion
             SET estado = 'cancelada'
             WHERE id_inscripcion = $1`,

            [id]

        );

        // =========================
        // DEVOLVER CUPO
        // =========================

        await pool.query(

            `UPDATE actividad
             SET cupos = cupos + 1
             WHERE id_actividad = $1`,

            [inscripcion.id_actividad]

        );

        res.json({

            message:
                "Inscripción cancelada correctamente"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error cancelando inscripción"

        });

    }

});

router.get(
    '/proxima/:idUsuario',
    async (req, res) => {

        try {

            const { idUsuario } = req.params;

            const result = await pool.query(

                `SELECT

                    a.nombre AS actividad,
                    a.fecha,
                    a.ubicacion

                FROM inscripcion i

                INNER JOIN actividad a
                    ON i.id_actividad = a.id_actividad

                WHERE
                    i.id_usuario = $1
                    AND i.estado = 'activa'

                ORDER BY a.fecha ASC

                LIMIT 1`,

                [idUsuario]

            );

            res.json(
                result.rows[0] || {}
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Error"
            });

        }

    }
);

module.exports = router;