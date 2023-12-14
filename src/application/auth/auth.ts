import * as jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

module.exports= (req:Request, res: Response, next:NextFunction)=>{
    try{
        const token = req.headers.authorization?.replace("Bearer ", "")
        if (token===undefined){
            return res.status(403).send("Crendenciais inválidas")
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret)
        req.body.userData=decoded
        next()
    }catch(e){
        const token = req.headers.authorization?.replace("Bearer ", "")
        const decoded = jwt.decode(token!) as jwt.JwtPayload | null
        if(decoded?.exp!=null){
            const data = new Date(decoded.exp as number)
            if((Date.now() - decoded.exp!)/(1000 * 60 * 60 * 24) < 1){
                let token= jwt.sign({
                    "id":  decoded.id
                }, process.env.JWT_SECRET as jwt.Secret, {
                    noTimestamp: true,
                    expiresIn: "24h"
                })
                req.body.newToken=token
                return next()

            }
        }
        res.status(403).send("Crendenciais inválidas")
    }
}