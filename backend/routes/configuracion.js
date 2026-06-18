const express = require('express');
const router = express.Router();
const pool = require('../db');


// =========================
// CONFIGURACION GENERAL
// =========================

router.get('/', async (req, res) => {

    try {

        const result =
            await pool.query(

                `SELECT *
                 FROM configuracion
                 LIMIT 1`

            );

        res.json(
            result.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error'
        });

    }

});


// =========================
// ACTUALIZAR CONFIGURACION
// =========================

router.put('/', async (req, res) => {

    const {

        nombre_organizacion,
        email_contacto,
        telefono,
        direccion

    } = req.body;

    try {

        await pool.query(

            `UPDATE configuracion

             SET

                nombre_organizacion = $1,
                email_contacto = $2,
                telefono = $3,
                direccion = $4

             WHERE id_configuracion = 1`,

            [

                nombre_organizacion,
                email_contacto,
                telefono,
                direccion

            ]

        );

        res.json({

            message:
                'Configuración actualizada'

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error'
        });

    }

});


// =========================
// CONFIG SISTEMA
// =========================

router.get('/sistema', async (req, res) => {

    try {

        const result =
            await pool.query(

                `SELECT *
                 FROM configuracion_sistema
                 LIMIT 1`

            );

        res.json(
            result.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error'
        });

    }

});


// =========================
// UPDATE SISTEMA
// =========================

router.put('/sistema', async (req, res) => {
    console.log(req.body);
    const {

        permitir_registro,
        permitir_comentarios,
        permitir_reinscripciones,
        mostrar_finalizadas,
        dias_cancelacion,
        cupos_default

    } = req.body;

    try {

        await pool.query(

            `UPDATE configuracion_sistema

             SET

                permitir_registro = $1,
                permitir_comentarios = $2,
                permitir_reinscripciones = $3,
                mostrar_finalizadas = $4,
                dias_cancelacion = $5,
                cupos_default = $6

             WHERE id_configuracion = 1`,

            [

                permitir_registro,
                permitir_comentarios,
                permitir_reinscripciones,
                mostrar_finalizadas,
                dias_cancelacion,
                cupos_default

            ]

        );

        res.json({

            message:
                'Configuración guardada'

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error'
        });

    }

});

module.exports = router;