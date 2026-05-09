const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor VoluntApp funcionando 🚀');
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const pool = require('./db');

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.post('/login', async (req, res) => {

    const { login, password } = req.body;

    try {

        const result = await pool.query(
            `SELECT * FROM usuario
             WHERE (email = $1 OR username = $1)
             AND password = $2`,
            [login, password]
        );

        if (result.rows.length > 0) {

            const user = result.rows[0];

            res.json({
                message: 'Login exitoso',
                user: {
                    id_usuario: user.id_usuario,
                    nombre: user.nombre,
                    username: user.username,
                    email: user.email,
                    rol: user.rol
                }
            });

        } else {

            res.status(401).json({
                message: 'Credenciales incorrectas'
            });

        }

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error en servidor'
        });

    }

});
app.post('/voluntarios', async (req, res) => {
    const { nombre, telefono, direccion, id_usuario } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO voluntario
            (nombre, telefono, direccion, id_usuario)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [nombre, telefono, direccion, id_usuario]
        );

        res.json({
            message: 'Voluntario creado correctamente',
            voluntario: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.get('/voluntarios', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM voluntario ORDER BY id_voluntario ASC'
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.put('/voluntarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, direccion } = req.body;

    try {
        const result = await pool.query(
            `UPDATE voluntario
             SET nombre = $1,
                 telefono = $2,
                 direccion = $3
             WHERE id_voluntario = $4
             RETURNING *`,
            [nombre, telefono, direccion, id]
        );

        if (result.rows.length > 0) {
            res.json({
                message: 'Voluntario actualizado correctamente',
                voluntario: result.rows[0]
            });
        } else {
            res.status(404).json({
                message: 'Voluntario no encontrado'
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.delete('/voluntarios/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM voluntario
             WHERE id_voluntario = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length > 0) {
            res.json({
                message: 'Voluntario eliminado correctamente'
            });
        } else {
            res.status(404).json({
                message: 'Voluntario no encontrado'
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

const campanasRoutes = require('./routes/campanas');
app.use('/campanas', campanasRoutes);

const actividadesRoutes = require('./routes/actividades');
app.use('/actividades', actividadesRoutes);

const inscripcionesRoutes = require('./routes/inscripciones');
app.use('/inscripciones', inscripcionesRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/dashboard', dashboardRoutes);