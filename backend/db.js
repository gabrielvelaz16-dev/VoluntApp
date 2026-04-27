const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'VoluntApp_DB', //llamada a la BASE DE DATOS
    password: '130499', //el que pusiste en pgAdmin
    port: 5432,
});

module.exports = pool;