import * as express from 'express';
import {IWebServerConfig, startServer} from 'express-web-server';
import * as bodyParser from "body-parser";
import noCache = require('no-cache-express');
import * as prettyPrinter from 'express-pretty-print';
import * as fs from 'fs';
import * as path from 'path';
import {IAppConfig} from './app-config';

let configFile: string = null;

if (process.argv.length < 3)
    configFile = path.join(__dirname, "../../configs/local-testing-config.json");
else
    configFile = process.argv[2];

let config: IAppConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

let app = express();

app.set('jsonp callback name', 'cb');

app.use(noCache);
app.use(bodyParser.text({"limit":"999mb"}));
app.use(bodyParser.json({"limit":"999mb"}));
app.use(prettyPrinter.get());

let count = 0;

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    count++;
    console.log("\n<<count++>> count=" + count.toString());
    req.on("end", () => {
        console.log("req => <<end>>");
        count--;
        console.log("<<count-->> count=" + count.toString());
    }).on("close", () => {
        console.log("req => <<close>>");
    }).on("error", (err: any) => {
        console.log("req => <<error>>, err=" + JSON.stringify(err));
    });

    res.on("finish", () => {
        console.log("res => <<finish>>");
    }).on("close", () => {
        console.log("res => <<close>>");
        count--;
        console.log("<<count-->> count=" + count.toString());
    }).on("error", (err: any) => {
        console.log("res => <<error>>, err=" + JSON.stringify(err));
    });
    next();
});

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

//console.log("env=\n" + JSON.stringify(process.env, null, 2) + "\n");
console.log("NODE_PATH=" + process.env["NODE_PATH"]);

const uuid = require("uuid");
console.log(uuid.v4());

let mod_id =require.resolve("uuid");
console.log("mod_id=" + mod_id);
let mod = <NodeModule>(require.cache[mod_id]);
console.log(mod.filename);

app.get("/hi", (req: express.Request, res: express.Response) => {
    setTimeout(() => {
        res.jsonp({msg: "How are you?"});
    }, 10000);
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
