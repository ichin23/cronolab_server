import * as jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

module.exports= (req:Request, res: Response, next:NextFunction)=>{
    try{
        const token = req.headers.authorization?.replace("Bearer ", "")
        console.log(req.hostname)
        console.log(req.originalUrl)
        if (token===undefined){
            console.log("Sem token")
            return res.status(403).send({
                code: 104,
                error: "Crendenciais inválidas"})
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret)
        req.body.userData=decoded
        next()
    }catch(e){
        const token = req.headers.authorization?.replace("Bearer ", "")
        const decoded = jwt.decode(token!) as jwt.JwtPayload | null
        console.log(decoded)

        if(decoded?.exp!=null){
            const data = new Date(decoded.exp*1000)
            const dif = ((new Date()).getTime() - data.getTime())/(1000 * 60 * 60 * 24)
            if( dif < 1 && dif>0){
               
                let token= jwt.sign({
                    "id":  decoded.id
                }, process.env.JWT_SECRET as jwt.Secret, {
                    noTimestamp: true,
                    expiresIn: "24h"
                })
                req.body.newToken=token
                
                req.body.userData=jwt.verify(token, process.env.JWT_SECRET as jwt.Secret)
                console.log(dif)
                return next()
            }
        }
        res.status(403).send({
            code: 104,
            error: "Crendenciais inválidas"})
    }
}