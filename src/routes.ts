import { Router } from "express";
import { turmacontroller } from "./application/TurmasController";
import { usercontroller } from "./application/user/userController";

const auth = require("./application/auth/auth")
const router: Router = Router()

router.get("/getTurmas", auth, turmacontroller.getTurmas)
router.post("/enterTurma", auth, turmacontroller.enterTurma)
router.post("/criarNovaTurma", auth, turmacontroller.criaTurma)

router.post("/criarMateria", auth, turmacontroller.checkAdminAccess, turmacontroller.addMateria)

router.post("/deveres", auth, turmacontroller.checkUserAccess, turmacontroller.getDeveres)
router.post("/criarDever", auth, turmacontroller.checkAdminAccess, turmacontroller.addDever)
router.put("/editDever", auth, turmacontroller.checkAdminAccess, turmacontroller.editDever)

router.put("/createUser", usercontroller.createUser)
router.post("/login", usercontroller.login)

export {router}