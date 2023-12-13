
import express from "express";
import { router } from "./routes";

export class App{
    public server: express.Application;

    constructor(){
        this.server=express();
        this.setConfigs()
        this.loadRoutes()
    }

    private setConfigs(){
        this.server.use(express.json())
    }

    private loadRoutes(){
        this.server.use(router)
    }
}