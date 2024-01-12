import { connection } from "../../databaseCon";
import  {Request, Response} from "express"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { RowDataPacket } from "mysql2";

class UserController{
    public async createUser(req:Request, res:Response){
        const body = req.body
       
        if(!body.email || !body.password || !body.name){
            res.status(400).send({"error": "You need to pass email, password and name'"})
            return;
        }
        var passHash = await bcrypt.hash(req.body.password, 10)
        
        let result = await connection.query("INSERT INTO usuario(nome, email, senha) VALUES (?,?,?)", [body.name, body.email, passHash])
        res.sendStatus(200)
       
    }

    public async login(req:Request, res:Response){
        const body = req.body
        if(!body.email || !body.password){
            res.status(400).send({"error": "You need to pass email, password and name'"})
            return;
        }

        let result = await connection.query("SELECT id, email, nome, senha FROM usuario WHERE email=? LIMIT 1", [body.email]) as RowDataPacket[]
        
        if (result.length==0){
            res.status(400).send("dados inválidos")
            return
        }
        const isMatching = await bcrypt.compare(body.password, result[0][0].senha)
        
        if(isMatching){
            
            let token = jwt.sign({
                "id":  result[0][0].id
            }, process.env.JWT_SECRET as jwt.Secret, {
                expiresIn: "24h"
            })
            console.log(token)
            return res.status(200).send({
                accessToken: token,
                userId: result[0][0].id,
                nome: result[0][0].nome,
                email: result[0][0].email

            })
            
        }
        res.status(403).send("dados inválidos")
    }
}

export const usercontroller = new UserController()