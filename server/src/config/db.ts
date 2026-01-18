import mariadb from 'mariadb';
import { CONFIG } from './env'; // No extension!

const pool = mariadb.createPool({
    host: CONFIG.DB_HOST,
    user: CONFIG.DB_USER,
    password: CONFIG.DB_PASSWORD,
    database: CONFIG.DB_NAME,
    port: CONFIG.DB_PORT,
    connectionLimit: 10, // Explicitly a number, no quotes

});


export default pool;