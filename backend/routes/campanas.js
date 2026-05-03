const express = require('express');
const router = express.Router();
const pool = require('../db'); // conexión a PostgreSQL

// ✅ CREAR CAMPAÑA
router.post('/', async (req, res) => {
    const { nombre, descripcion, fecha_inicio, fecha_fin, responsable } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO campaña (nombre, descripcion, fecha_inicio, fecha_fin, responsable)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nombre, descripcion, fecha_inicio, fecha_fin, responsable]
        );

        res.json({
            message: "Campaña creada",
            campaña: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: "Error al crear campaña" });
    }
});

// ✅ LISTAR CAMPAÑAS
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM campaña ORDER BY id_campaña DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener campañas" });
    }
});

// ✅ OBTENER UNA CAMPAÑA
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM campaña WHERE id_campaña = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Campaña no encontrada" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: "Error al buscar campaña" });
    }
});

// ✅ ACTUALIZAR CAMPAÑA
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, fecha_inicio, fecha_fin, estado, responsable } = req.body;

    try {
        await pool.query(
            `UPDATE campaña
             SET nombre=$1, descripcion=$2, fecha_inicio=$3, fecha_fin=$4, estado=$5, responsable=$6
             WHERE id_campaña=$7`,
            [nombre, descripcion, fecha_inicio, fecha_fin, estado, responsable, id]
        );

        res.json({ message: "Campaña actualizada" });

    } catch (error) {
        res.status(500).json({ error: "Error al actualizar campaña" });
    }
});

// ✅ ELIMINAR CAMPAÑA
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(
            'DELETE FROM campaña WHERE id_campaña = $1',
            [id]
        );

        res.json({ message: "Campaña eliminada" });

    } catch (error) {
        res.status(500).json({ error: "Error al eliminar campaña" });
    }
});

module.exports = router;