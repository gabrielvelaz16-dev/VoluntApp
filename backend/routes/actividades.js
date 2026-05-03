const express = require('express');
const router = express.Router();
const pool = require('../db');

// ✅ CREAR ACTIVIDAD
router.post('/', async (req, res) => {
    const { nombre, descripcion, fecha, ubicacion, cupos, id_campaña } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO actividad (nombre, descripcion, fecha, ubicacion, cupos, id_campaña)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [nombre, descripcion, fecha, ubicacion, cupos, id_campaña]
        );

        res.json({
            message: "Actividad creada",
            actividad: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear actividad" });
    }
});

// ✅ LISTAR ACTIVIDADES (con campaña)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, c.nombre AS campaña
            FROM actividad a
            LEFT JOIN campaña c ON a.id_campaña = c.id_campaña
            ORDER BY a.id_actividad DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener actividades" });
    }
});

// ✅ ELIMINAR ACTIVIDAD
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(
            'DELETE FROM actividad WHERE id_actividad = $1',
            [id]
        );

        res.json({ message: "Actividad eliminada" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar actividad" });
    }
});

module.exports = router;