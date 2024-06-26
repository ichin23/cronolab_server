
import express from "express";
import { router } from "./routes";
import cors from "cors";
var morgan = require('morgan')

export class App{
    public server: express.Application;

    constructor(){
        this.server=express();
        this.setConfigs()
        this.loadRoutes()
    }

    private setConfigs(){
        this.server.use(cors())
        this.server.use(express.json())
        this.server.use(morgan('dev'))
        
    }

    private loadRoutes(){
        this.server.use(router)
    }
}