import pg from "pg";
import { env } from "./env.js";

const {Pool} = pg;

const pool = new Pool({
    host: env.DB.HOST,
    user: env.DB.USER,
    port: env.DB.PORT,
    password: env.DB.PASSWORD,
    database: env.DB.NAME
});

pool.connect((err, client, release)=>{
    if(err){
        return console.error("❌ Gagal terhubung ke PostgreSQL:", err.message);
    }
    console.log("🐘 PostgreSQL & PostGIS berhasil terhubung!");
    release();
});

export { pool };