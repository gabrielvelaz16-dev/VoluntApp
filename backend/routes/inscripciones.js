const express = require('express');
const router = express.Router();
const pool = require('../db');

// ✅ INSCRIBIR VOLUNTARIO
router.post('/', async (req, res) => {
    const { id_voluntario, id_actividad } = req.body;

    try {
        // verificar cupos
        const actividad = await pool.query(
            'SELECT cupos FROM actividad WHERE id_actividad = $1',
            [id_actividad]
        );

        if (actividad.rows.length === 0) {
            return res.status(404).json({ message: "Actividad no encontrada" });
        }

        if (actividad.rows[0].cupos <= 0) {
            return res.status(400).json({ message: "No hay cupos disponibles" });
        }

        // insertar inscripción
        await pool.query(
            `INSERT INTO inscripcion (id_voluntario, id_actividad)
             VALUES ($1, $2)`,
            [id_voluntario, id_actividad]
        );

        // restar cupo
        await pool.query(
            `UPDATE actividad
             SET cupos = cupos - 1
             WHERE id_actividad = $1`,
            [id_actividad]
        );

        res.json({ message: "Inscripción realizada correctamente" });

    } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Error al inscribirse",
                detalle: error.message
            });
    }
});


// ✅ LISTAR INSCRIPCIONES
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT i.id_inscripcion,
                   v.nombre AS voluntario,
                   a.nombre AS actividad,
                   c.nombre AS campaña,
                   i.fecha_inscripcion
            FROM inscripcion i
            JOIN voluntario v ON i.id_voluntario = v.id_voluntario
            JOIN actividad a ON i.id_actividad = a.id_actividad
            LEFT JOIN campaña c ON a.id_campaña = c.id_campaña
            ORDER BY i.id_inscripcion DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener inscripciones" });
    }
});


// ✅ CANCELAR INSCRIPCIÓN
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // recuperar actividad
        const insc = await pool.query(
            'SELECT id_actividad FROM inscripcion WHERE id_inscripcion = $1',
            [id]
        );

        if (insc.rows.length === 0) {
            return res.status(404).json({ message: "Inscripción no encontrada" });
        }

        const id_actividad = insc.rows[0].id_actividad;

        // eliminar inscripción
        await pool.query(
            'DELETE FROM inscripcion WHERE id_inscripcion = $1',
            [id]
        );

        // devolver cupo
        await pool.query(
            'UPDATE actividad SET cupos = cupos + 1 WHERE id_actividad = $1',
            [id_actividad]
        );

        res.json({ message: "Inscripción cancelada" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cancelar inscripción" });
    }
});

module.exports = router;