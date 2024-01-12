
import express from "express";
import { router } from "./routes";
var morgan = require('morgan')

export class App{
    public server: express.Application;

    constructor(){
        this.server=express();
        this.setConfigs()
        this.loadRoutes()
    }

    private setConfigs(){
        this.server.use(express.json())
        this.server.use(morgan('dev'))
        
    }

    private loadRoutes(){
        this.server.use(router)
    }
}