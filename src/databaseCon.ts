import {Pool, createPool} from "mysql2/promise"


import dotenv from 'dotenv'


dotenv.config()

const connection: Pool =  createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    database: process.env.MYSQL_DATABASE
})

export {connection}