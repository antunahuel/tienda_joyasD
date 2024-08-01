import pg from "pg";

const {Pool}=pg;

const db = new Pool({
    user:'postgres',
    port:5432,
    host:'localhost',
    password:'123456',
    database:'db_tienda_joyas',
})

// let results = await db.query('SELECT NOW()');
// console.log(results.rows[0]);

export default db;
