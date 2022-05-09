const { Pool } = require("pg")

const config = ({
    host: 'localhost',
    user: 'postgres',
    password: 'Naturales13',
    database: 'management_db',
    port: 5432
});
const pool = new Pool(config);

module.exports = pool;