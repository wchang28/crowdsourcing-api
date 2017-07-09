import * as express from 'express';
import {IWebServerConfig, startServer} from 'express-web-server';
import * as bodyParser from "body-parser";
import noCache = require('no-cache-express');
import * as prettyPrinter from 'express-pretty-print';
import * as fs from 'fs';
import * as path from 'path';
import {IAppConfig} from './app-config';
import * as events from "events";
import {get as getServerManager, IServerMessenger} from "./server-mgr";
import * as sm from "./state-machine";

let configFile: string = null;

if (process.argv.length < 3)
    configFile = path.join(__dirname, "../../../configs/local-testing-config.json");
else
    configFile = process.argv[2];

let config: IAppConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

let appMsg = express();
appMsg.set('jsonp callback name', 'cb');
appMsg.use(noCache);
appMsg.use(bodyParser.json({"limit":"999mb"}));
appMsg.use(prettyPrinter.get());

startServer(config.msgServerConfig, appMsg, (secure:boolean, host:string, port:number) => {
    let protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway msg server listening at %s://%s:%s', protocol, host, port);
}, (err:any) => {
    console.error(new Date().toISOString() + ': !!! api gateway msg server error: ' + JSON.stringify(err));
    process.exit(1);
});

/*
    notifyToTerminate(InstanceId: string): void;
    on(event: "instance-launched", listener: (InstanceId: sm.ServerId) => void) : this;
    on(event: "instance-terminated", listener: (InstanceId: sm.ServerId) => void): this;
*/
class ServerMessenger extends events.EventEmitter implements IServerMessenger {
    constructor() {
        super();
    }
    notifyToTerminate(InstanceId: string): void {

    }
}

let stateMachine = sm.get(getServerManager(config.availableApiServerPorts, new ServerMessenger()));
stateMachine.on("ready", () => {    // api server is ready => get the proxy ready
    let appProxy = express();

});

let appAdmin = express();
appAdmin.set('jsonp callback name', 'cb');
appAdmin.use(noCache);
appAdmin.use(bodyParser.json({"limit":"999mb"}));
appAdmin.use(prettyPrinter.get());

startServer(config.adminServerConfig, appAdmin, (secure:boolean, host:string, port:number) => {
    let protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway admin server listening at %s://%s:%s', protocol, host, port);
    stateMachine.initialize();
}, (err:any) => {
    console.error(new Date().toISOString() + ': !!! api gateway admin server error: ' + JSON.stringify(err));
    process.exit(1);
});