import { QueryError, RowDataPacket } from "mysql2";
import { connection } from "../databaseCon";
import { NextFunction, Request, Response } from "express";

class TurmasController {
    public async checkAdminAccess(req:Request, res:Response, next:NextFunction){
        if(!req.body.turmaId && !req.body.materiaId && !req.query.materiaId && !req.query.deverId){
            return res.status(400).send("Passe o turmaId ou materiaId")
        }

        let query = req.body.turmaId ? "SELECT * FROM usuarioGerenciaTurma WHERE idUsuario=? AND idTurma=?" : (req.body.materiaId || req.query.materiaId)? "SELECT idTurma, idUsuario FROM usuarioGerenciaTurma g INNER JOIN materia m ON m.turmaID=g.idTurma WHERE g.idUsuario=? AND m.id=?" : "SELECT idTurma, idUsuario FROM usuarioGerenciaTurma g INNER JOIN materia m ON m.turmaID=g.idTurma INNER JOIN dever d ON d.idMateria=m.id WHERE g.idUsuario=? AND d.id=?"
        let param= req.body.turmaId ?? req.body.materiaId ?? req.query.materiaId ?? req.query.deverId
        console.log(query)
        console.log(param)
        let result = await connection.query(query,[req.body.userData.id, param]) as RowDataPacket[]
        console.log(result)
        if(result[0].length==0){
            return res.status(403).send("Sem acesso a modificação da turma")
        }
        next()
    }

    public async checkUserAccess(req:Request, res:Response, next:NextFunction){
        if(!req.body.turmas && !req.body.turmaId && !req.body.deverId){
            return res.status(400).send("Bad Request")
        }

        if (req.body.deverId != undefined){
            console.log(req.body.deverId)
            req.body.turmaId = (await connection.query("SELECT getTurmadoDever(?) id", [req.body.deverId]) as RowDataPacket[])[0][0]["id"]
            
            if(!req.body.turmaId){
                return res.send(400).send({error: "deverId inválido"})
            }
        }

        var turmas = req.body.turmas ?? [req.body.turmaId]

        for (const turma of turmas){
            let result = await connection.query("SELECT * FROM usuarioParticipaTurma WHERE idUsuario=? AND idTurma=?", [req.body.userData.id, turma])as RowDataPacket[]

            if(result[0].length==0){
                return res.status(403).send("Sem acesso a turma: "+turma)
            }
        }
        next()
    }

    public async getData(req:Request, res:Response){
        var final :Map<String, any> = new Map()
        let turmas = await connection.query(
            "SELECT id, nome, senha, COUNT(g.idUsuario) AS admin FROM turma t LEFT JOIN usuarioParticipaTurma p ON t.id=p.idTurma LEFT JOIN usuarioGerenciaTurma g ON t.id=g.idTurma WHERE p.idUsuario=? GROUP by id, g.idTurma",
             [req.body.userData.id]
        ) as RowDataPacket[]
        
        var turmasIds = Array.from(turmas[0].map((e:any)=>e.id))
        if(turmasIds.length==0){
            return res.send({"turmas":[], "materias":[], "deveres":[]})
        }
        var materias = await connection.query("SELECT * FROM materia WHERE turmaId IN (?)", [turmasIds])
      
        var deveres = await connection.query("SELECT d.id, d.nome, d.pontos, d.dataHora, d.idMateria, d.local, d.descricao, COUNT(uD.idUsuario) concluiu FROM dever d INNER JOIN materia m ON d.idMateria=m.id LEFT JOIN usuarioDever uD ON d.id = uD.idDever AND uD.idUsuario=1 WHERE m.turmaID IN (?) AND dataHora>NOW() GROUP BY uD.idUsuario, d.id ORDER BY concluiu, dataHora", [turmasIds])
        

        res.send({
            "turmas":   turmas[0],
            "materias": materias[0],
            "deveres":  deveres[0]
        })
    }

    //GET()
    public async getTurmas(req:Request, res:Response){
        let results = await connection.query(
            "SELECT id, nome, senha, COUNT(g.idUsuario) AS admin FROM turma t LEFT JOIN usuarioParticipaTurma p ON t.id=p.idTurma LEFT JOIN usuarioGerenciaTurma g ON t.id=g.idTurma WHERE p.idUsuario=? GROUP by id, g.idTurma",
             [req.body.userData.id]
        )
        return res.send(results[0])
    }

    //POST(turmaId)
    public async enterTurma(req: Request, res:Response){
        if(!req.body.turmaId){
            return res.status(400).send("Missing turmaId")
        }
        let queryTurma = await connection.query("SELECT nome FROM turma WHERE id=?", [req.body.turmaId]) as RowDataPacket[]
       
        if(queryTurma[0].length<=0){
            return res.status(404).send("Turma não encontrada")
        }
        await connection.query("INSERT INTO usuarioParticipaTurma(idUsuario, idTurma) VALUES (?,?)", [req.body.userData.id, req.body.turmaId])
        res.send("OK")
    }

    //POST(turmaId, nome)
    public async criaTurma(req:Request, res:Response){
        try{
            if(!req.body.turmaId || !req.body.nome){
                return res.status(400).send("Missing params")
            }

            let queryTurma = await connection.query("SELECT nome FROM turma WHERE id=?", [req.body.turmaId]) as RowDataPacket[]
            if(queryTurma[0].length>0){
                return res.status(400).send("código já está em uso")
            }

            await connection.query("INSERT INTO turma(id, nome) values(?, ?)", [req.body.turmaId, req.body.nome])
            await connection.query("INSERT INTO usuarioParticipaTurma(idUsuario, idTurma) VALUES (?,?)", [req.body.userData.id, req.body.turmaId])
            await connection.query("INSERT INTO usuarioGerenciaTurma(idUsuario, idTurma) VALUES (?,?)", [req.body.userData.id, req.body.turmaId])
            res.status(200).send("OK")
        }catch(e){
            res.status(500).send(e)
        }
    }

    //DELETE(turmaId)
    public async sairTurma(req:Request, res:Response){
        try{
            await connection.query("START TRANSACTION")
            let presidente =(await connection.query("SELECT presidente FROM turma WHERE id=?", [req.body.turmaId]) as RowDataPacket[])[0][0]["presidente"]
            if(presidente===req.body.userData.id){
                await connection.query(
                    "UPDATE turma SET presidente=(SELECT DISTINCT idUsuario FROM usuarioGerenciaTurma WHERE idTurma=? AND idUsuario != ? LIMIT 1) WHERE id= ?",
                    [req.body.turmaId, req.body.userData.id, req.body.turmaId]
                )
            }
            await connection.query("DELETE u from usuarioDever u INNER JOIN dever d ON d.id=idDever INNER JOIN materia m ON m.id=d.idMateria WHERE m.turmaID=? AND idUsuario=?", [req.body.turmaId, req.body.userData.id ])
            await connection.query("DELETE FROM usuarioParticipaTurma WHERE idUsuario=? AND idTurma=?",[req.body.userData.id, req.body.turmaId])
            await connection.query("DELETE FROM usuarioGerenciaTurma WHERE idUsuario=? AND idTurma=?",[req.body.userData.id, req.body.turmaId])
            await connection.query("COMMIT")
            res.send("OK")
        }catch(e:any){
            await connection.query("ROLLBACK")
            if(e.errno===1048){
                if(req.body.force===true){
                    await connection.query("DELETE u from usuarioDever u INNER JOIN dever d ON d.id=idDever INNER JOIN materia m ON m.id=d.idMateria WHERE m.turmaID=? AND idUsuario=?", [req.body.turmaId, req.body.userData.id ])
                    await connection.query("DELETE FROM usuarioParticipaTurma WHERE idUsuario=? AND idTurma=?",[req.body.userData.id, req.body.turmaId])
                    await connection.query("DELETE FROM usuarioGerenciaTurma WHERE idUsuario=? AND idTurma=?",[req.body.userData.id, req.body.turmaId])
                    return res.send({res: "OK"})
                }
                return res.status(405).send("Você é o único administrador.")
            }
            
            res.status(500).send("Ocorreu um erro")
        }
    }
    public async deleteTurma(req:Request, res:Response){}

    //POST(userId, turmaId)
    public async addAdmin(req:Request, res:Response){
        let body = req.body
        if(!body.userId || !body.turmaId) return res.send(400).send({message: "Passe um id de usuário",code:101})

        await connection.query("INSERT INTO usuarioGerenciaTurma(idUsuario, idTurma) VALUES (?,?)",[body.userId, body.turmaId])
        return res.send("OK")
    }

    //DELETE(userId, turmaId)
    public async removeAdmin(req:Request, res:Response){
        let body=req.body
        let presidente = await connection.query("SELECT presidente FROM turma WHERE id=?",[body.turmaId])
        if(body.userId==presidente) return res.status(405).send({message: "Can't remove president", code: 102})

        await connection.query("DELETE FROM usuarioGerenciaTurma WHERE idUsuario=?",[body.userId])
        res.send("OK")
    }

    

    public async getParticipantes(req:Request, res:Response){
        let body=req.body
        let users = await connection.query("SELECT id, nome, COUNT(g.idUsuario) admin FROM usuario u INNER JOIN usuarioParticipaTurma p ON u.id=p.idUsuario LEFT JOIN usuarioGerenciaTurma g ON g.idUsuario=u.id WHERE p.idTurma=? GROUP BY g.idUsuario, id",[body.turmaId])
        res.send(users[0])
    }

    public async getDeveres(req:Request, res:Response){
        let body = req.body

        var result = await connection.query("SELECT * FROM dever d INNER JOIN materia m ON d.idMateria=m.id WHERE m.turmaID IN (?) AND dataHora>CURDATE()", [body.turmas])
        console.log(result[0])
        res.send(result[0])
    }

    //POST(titulo, materiaId, pontos, dataHora)
    public async addDever(req:Request, res:Response){
        let body = req.body
        console.log(body)
        console.log(!body.titulo)
        console.log(!body.pontos)
        console.log(!body.dataHora)
        console.log(!body.materiaId)
        if(!body.titulo || body.pontos==undefined || !body.dataHora || !body.materiaId){
            return res.status(400).send("Missing Params: (titulo, pontos, dataHora, materiaId)")
        }
        await connection.query("INSERT INTO dever(nome, pontos, dataHora, idMateria, local, descricao) VALUES (?,?,?,?,?,?)",
         [body.titulo, body.pontos, body.dataHora, body.materiaId, body.local, body.descricao])
        res.send("OK")
    }

    //PUT(deverId, nome?, pontos?, dataHora?. idMateria?, deverId?)
    public async editDever(req:Request, res:Response){
        let body = req.body
        if (body.length==0) return res.status(400).send("Bad request")

        let dever = await connection.query("SELECT * FROM dever WHERE id=?", [body.deverId]) as RowDataPacket
        let deverData =dever[0][0]
        var final = [
             req.body.titulo ?? deverData.titulo,
             req.body.pontos ?? deverData.pontos,
             req.body.dataHora ?? deverData.dataHora,
             req.body.idMateria ?? deverData.idMateria,
             req.body.descricao ?? deverData.descricao,
             req.body.deverId
        ]

        await connection.query("UPDATE dever SET nome=?, pontos=?, dataHora=?, idMateria=?, descricao=? WHERE id=?", final),
        res.send("OK")
    }

    //PUT(deverId, status)
    public async alterarStatusDever(req:Request, res:Response){
        var concluido = req.body.status ?? true
        try{
            if(concluido){
                await connection.query("INSERT INTO usuarioDever(idUsuario, idDever, dataConcluiu) VALUES (?, ?, NOW())", [req.body.userData.id, req.body.deverId])
            }else{
                await connection.query("DELETE FROM usuarioDever WHERE idUsuario=? AND idDever=?", [req.body.userData.id, req.body.deverId])
            }
        }catch(e){
                    
        }finally{
            return res.send({mes: "OK"});
        }
    }


    //DELETE(idDever)
    public async deleteDever(req:Request, res:Response){
        if(!req.query.deverId) return res.status(400).send("Bad Request")
        await connection.query("DELETE FROM dever WHERE id=?",[req.query.deverId])
        res.send("OK")
    }

    public async getMaterias(req:Request, res:Response){
        let body = req.body
        if(!body.turmaId && !body.turmas) res.status(400).send("Missing Params: (turmas|turmaId)")

        var turmas = body.turmas ?? [body.turmaId]
        var materias = await connection.query("SELECT * FROM materia WHERE turmaId IN (?)", [turmas])
        res.send(materias[0])
    }
    
    //POST(nome, professor, contato, turmaId)
    public async addMateria(req:Request, res:Response){
        let body = req.body
        if(!body.nome || !body.professor || !body.contato || !body.turmaId){
            return res.status(400).send("Missing Params: (nome, professor, contato, turmaId)")
        }

        await connection.query("INSERT INTO materia(nome, professor, contato, turmaId) VALUES (?,?,?,?)",
         [body.nome, body.professor, body.contato, body.turmaId])
        res.send("OK")
    }

    public async editMateria(req:Request, res:Response){
        let body = req.body
        if (body.length>=1) return res.status(400).send("Bad request")
        
        let materia = (await connection.query("SELECT * FROM materia WHERE id=?",[body.idMateria]) as RowDataPacket)[0][0]
        var final =[
            body.nome ?? materia.nome, 
            body.professor ?? materia.professor,
            body.contato ?? materia.contato,
            body.idMateria ?? materia.idMateria
        ]

        await connection.query("UPDATE materia SET nome=?, professor=?, contato=? WHERE id=?", final)
        res.send("OK")
        
    }
    public async deleteMateria(req:Request, res:Response){
        await connection.query("DELETE FROM dever WHERE idMateria=?",[req.query.materiaId])
        await connection.query("DELETE FROM materia WHERE id=?",[req.query.materiaId])
        res.send("OK")
    }
}

export const turmacontroller = new TurmasController()