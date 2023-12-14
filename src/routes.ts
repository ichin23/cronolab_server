import { Router } from "express";
import { turmacontroller } from "./application/TurmasController";
import { usercontroller } from "./application/user/userController";

const auth = require("./application/auth/auth")
const router: Router = Router()

router.get("/getTurmas", auth, turmacontroller.getTurmas)
router.post("/enterTurma", auth, turmacontroller.enterTurma)
router.post("/criarTurma", auth, turmacontroller.criaTurma)
router.delete("/sairTurma", auth, turmacontroller.checkUserAccess, turmacontroller.sairTurma)
router.post("/addAdmin", auth, turmacontroller.checkAdminAccess, turmacontroller.addAdmin)

router.post("/criarMateria", auth, turmacontroller.checkAdminAccess, turmacontroller.addMateria)
router.post("/editMateria", auth, turmacontroller.checkAdminAccess, turmacontroller.editMateria)
router.delete("/materia", auth, turmacontroller.checkAdminAccess, turmacontroller.deleteMateria)

router.post("/deveres", auth, turmacontroller.checkUserAccess, turmacontroller.getDeveres)
router.post("/dever", auth, turmacontroller.checkAdminAccess, turmacontroller.addDever)
router.put("/editDever", auth, turmacontroller.checkAdminAccess, turmacontroller.editDever)
router.delete("/dever", auth,turmacontroller.checkAdminAccess, turmacontroller.deleteDever)

router.put("/createUser", usercontroller.createUser)
router.post("/login", usercontroller.login)

export {router}