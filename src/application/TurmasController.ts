import { RowDataPacket } from "mysql2";
import { connection } from "../databaseCon";
import { NextFunction, Request, Response } from "express";

class TurmasController {
    public async checkAdminAccess(req:Request, res:Response, next:NextFunction){
        let result = await connection.query("SELECT * FROM usuarioGerenciaTurma WHERE idUsuario=? AND idTurma=?",[req.body.userData.id, req.body.turmaId]) as RowDataPacket[]
        console.log(result[0])
        if(result[0].length==0){
            return res.status(403).send("Sem acesso a modificação da turma")
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

    public async getDeveres(req:Request, res:Response){}
    //POST(titulo, materiaId, pontos, dataHora)
    public async addDever(req:Request, res:Response){
        let body = req.body
        if(!body.titulo || !body.pontos || !body.dataHora || !body.materiaId){
            return res.status(400).send("Missing Params: (titulo, pontos, dataHora, materiaId)")
        }
        await connection.query("INSER INTO dever(titulo, pontos, dataHora, idMateria) VALUES (?,?,?,?)",
         [body.titulo, body.pontos, body.dataHora, body.materiaId])
        res.send("OK")
    }
    //PUT()
    public async editDever(req:Request, res:Response){}
    public async deleteDever(req:Request, res:Response){}
    
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
    public async editMateria(req:Request, res:Response){}
    public async deleteMateria(req:Request, res:Response){}
}

export const turmacontroller = new TurmasController()