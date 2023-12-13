import * as jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

module.exports= (req:Request, res: Response, next:NextFunction)=>{
    try{
        const token = req.headers.authorization?.replace("Bearer ", "")
        if (token===undefined){
            throw Error("token inválido")
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret)
        req.body.userData=decoded
        next()
    }catch(e){
        res.status(403).send("Crendenciais inválidas")
    }
}