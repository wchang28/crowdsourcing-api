import * as events from "events";
import * as express from 'express';
import * as bodyParser from "body-parser";
import noCache = require('no-cache-express');
import * as prettyPrinter from 'express-pretty-print';
import {getAllExtensionModules} from "../extensions";
import {ExtensionModuleExport} from "../../index";

let NODE_PATH = process.env["NODE_PATH"];

export interface IAPIAppFactory {
    create() : express.Express;
    on(event: "app-just-created", listener: (app: express.Express) => void) : this;
}

class APIAppFactory extends events.EventEmitter implements IAPIAppFactory {
    constructor() {
        super();
    }
    create() : express.Express {    // create the api app
        let app = express();
        this.emit("app-just-created", app);

        app.set('jsonp callback name', 'cb');

        app.use(noCache);
        app.use(bodyParser.text({"limit":"999mb"}));
        app.use(bodyParser.json({"limit":"999mb"}));
        app.use(prettyPrinter.get());

        app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });

        app.options("/*", (req: express.Request, res: express.Response) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH,HEAD');
            res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Content-Length,X-Requested-With');
            res.send(200);
        });

        let serviceRouter = express.Router();

        let extensionModules = getAllExtensionModules(NODE_PATH);
        for (let i in extensionModules) {   // for each module
            let module = extensionModules[i].module;
            try {
                let moduleExport: ExtensionModuleExport = require(module);
                let moduleRouter = express.Router();
                serviceRouter.use("/" + module, moduleRouter);
                moduleExport.init(moduleRouter);
            } catch(e) {

            }
        }

        app.use("/services", serviceRouter);

        return app;
    } 
}

export function get() : IAPIAppFactory {return new APIAppFactory();}