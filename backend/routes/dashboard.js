const express = require('express');
const router = express.Router();
const pool = require('../db');

// Estadísticas generales
router.get('/stats', async (req, res) => {
    try {
        const voluntarios = await pool.query('SELECT COUNT(*) FROM voluntario');
        const campañas = await pool.query('SELECT COUNT(*) FROM campaña');
        const actividades = await pool.query('SELECT COUNT(*) FROM actividad');
        const inscripciones = await pool.query('SELECT COUNT(*) FROM inscripcion');

        res.json({
            voluntarios: parseInt(voluntarios.rows[0].count),
            campañas: parseInt(campañas.rows[0].count),
            actividades: parseInt(actividades.rows[0].count),
            inscripciones: parseInt(inscripciones.rows[0].count)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
});

module.exports = router;

