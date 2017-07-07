import * as express from 'express';
import {IWebServerConfig, startServer} from 'express-web-server';
import * as bodyParser from "body-parser";
import noCache = require('no-cache-express');
import * as prettyPrinter from 'express-pretty-print';
import * as fs from 'fs';
import * as path from 'path';
import {IAppConfig} from './app-config';

let config: IAppConfig = null;

if (process.argv.length < 3) {
    console.error("config file not optional!");
    process.exit(1);
}

config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

let app = express();

app.set('jsonp callback name', 'cb');

app.use(noCache);
app.use(bodyParser.text({"limit":"999mb"}));
app.use(bodyParser.json({"limit":"999mb"}));
app.use(prettyPrinter.get());

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("\n" + new Date().toISOString() + ': method=' + req.method + ', url=' + req.url + "\nheaders=\n" + JSON.stringify(req.headers, null, 2));
    next();
});

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

//app.set("global", g);

//app.use('/services', servicesRouter);

startServer(config.webServerConfig, app, (secure:boolean, host:string, port:number) => {
    let protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': crowdsourcing api server listening at %s://%s:%s', protocol, host, port);
}, (err:any) => {
    console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
    process.exit(1);
});
