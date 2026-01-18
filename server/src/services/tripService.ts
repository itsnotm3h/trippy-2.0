import pool from '../config/db';

export const getAllTrips = async ()=>{
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM trips");
        return rows;
    }finally{
        if(conn) conn.release();
    }
}