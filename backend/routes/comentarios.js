const express = require('express');

const router = express.Router();

const pool = require('../db');


// =========================
// CREAR COMENTARIO
// =========================

router.post('/', async (req, res) => {

    const {

        id_usuario,
        id_actividad,
        comentario

    } = req.body;

    const config = await pool.query(
    `SELECT permitir_comentarios
     FROM configuracion_sistema
     LIMIT 1`
    );

    if (
        !config.rows[0].permitir_comentarios
    ) {
        return res.status(403).json({
            message:
                "Los comentarios están deshabilitados por el administrador"
        });
    }

    try {

        await pool.query(

            `INSERT INTO comentario (

                id_usuario,
                id_actividad,
                comentario

            )

            VALUES ($1,$2,$3)`,

            [

                id_usuario,
                id_actividad,
                comentario

            ]

        );

        res.json({

            message:
                "Comentario agregado correctamente"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error creando comentario"

        });

    }

});


// =========================
// LISTAR COMENTARIOS
// =========================

router.get('/', async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT

                c.id_comentario,

                c.comentario,

                c.fecha_comentario,

                c.estado,

                u.nombre || ' ' || u.apellido
                    AS usuario,

                a.nombre
                    AS actividad

            FROM comentario c

            INNER JOIN usuario u
                ON c.id_usuario = u.id_usuario

            INNER JOIN actividad a
                ON c.id_actividad = a.id_actividad


            ORDER BY c.id_comentario DESC`

        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error obteniendo comentarios"

        });

    }

});


// =========================
// ELIMINAR COMENTARIO
// =========================

router.put('/:id/eliminar', async (req, res) => {

    const { id } = req.params;

    try {

        await pool.query(

            `UPDATE comentario
             SET estado = 'eliminado'
             WHERE id_comentario = $1`,

            [id]

        );

        res.json({

            message:
                "Comentario eliminado"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Error eliminando comentario"

        });

    }

});

module.exports = router;