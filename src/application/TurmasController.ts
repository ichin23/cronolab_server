import { RowDataPacket } from "mysql2";
import { connection } from "../databaseCon";
import { NextFunction, Request, Response } from "express";

class TurmasController {
    public async checkAdminAccess(req:Request, res:Response, next:NextFunction){
        if(!req.body.turmaId && !req.body.materiaId){
            return res.status(400).send("Passe o turmaId ou materiaId")
        }

        let query = req.body.turmaId ? "SELECT * FROM usuarioGerenciaTurma WHERE idUsuario=? AND idTurma=?" : "SELECT idTurma, idUsuario FROM usuarioGerenciaTurma g INNER JOIN materia m ON m.turmaID=g.idTurma WHERE g.idUsuario=? AND m.id=?"
        let param= req.body.turmaId ?? req.body.materiaId
        let result = await connection.query(query,[req.body.userData.id, param]) as RowDataPacket[]
        console.log(result[0])
        if(result[0].length==0){
            return res.status(403).send("Sem acesso a modificação da turma")
        }
        next()
    }

    public async checkUserAccess(req:Request, res:Response, next:NextFunction){
        if(!req.body.turmas && !req.body.turmaID){
            return res.status(400).send("Bad Request")
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
            res.status(404).send("Turma não encontrada")
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

    
    public async sairTurma(req:Request, res:Response){}
    public async deleteTurma(req:Request, res:Response){}
    public async adicionaAdmin(req:Request, res:Response){}
    public async removeAdmin(req:Request, res:Response){}

    public async getDeveres(req:Request, res:Response){
        let body = req.body

        var result = await connection.query("SELECT d.id, d.nome, d.pontos, d.dataHora, d.idMateria FROM dever d INNER JOIN materia m ON d.idMateria=m.id WHERE m.turmaID IN (?)", [body.turmas])
        res.send(result[0])
    }

    //POST(titulo, materiaId, pontos, dataHora)
    public async addDever(req:Request, res:Response){
        let body = req.body
        if(!body.titulo || !body.pontos || !body.dataHora || !body.materiaId){
            return res.status(400).send("Missing Params: (titulo, pontos, dataHora, materiaId)")
        }
        await connection.query("INSERT INTO dever(nome, pontos, dataHora, idMateria) VALUES (?,?,?,?)",
         [body.titulo, body.pontos, body.dataHora, body.materiaId])
        res.send("OK")
    }

    //PUT(deverId, nome?, pontos?, dataHora?. idMateria?, deverId?)
    public async editDever(req:Request, res:Response){
        let body = req.body
        if (body.length==0) return res.status(400).send("Bad request")

        let dever = await connection.query("SELECT * FROM dever WHERE id=?", [body.deverId]) as RowDataPacket
        let deverData =dever[0][0]
        var final = [
             req.body.nome ?? deverData.nome,
             req.body.pontos ?? deverData.pontos,
             req.body.dataHora ?? deverData.dataHora,
             req.body.idMateria ?? deverData.idMateria,
             req.body.deverId
        ]

        await connection.query("UPDATE dever SET nome=?, pontos=?, dataHora=?, idMateria=? WHERE id=?", final),
        res.send("OK")

    }
    //DELETE(idDever)
    public async deleteDever(req:Request, res:Response){
        if(!req.params.id) return res.status(400).send("Bad Request")
        await connection.query("DELETE FROM dever WHERE id=?",[req.params.id])
        res.send("OK")
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
        await connection.query("DELETE FROM dever WHERE idMateria=?",[req.params.id])
        await connection.query("DELETE FROM materia WHERE id=?",[req.params.id])
        res.send("OK")
    }
}

export const turmacontroller = new TurmasController()