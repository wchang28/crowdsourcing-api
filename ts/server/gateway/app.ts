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
import * as tr from 'rcf-message-router';
import {Router as msgRouter, ConnectionsManager} from "./msg";
import {Message, ServerId, ReadyContent} from "./message";
import {IGlobal} from "./global";
import {Router as servicesRouter} from "./services";
import * as proxy from "express-http-proxy";

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

appMsg.use('/msg', msgRouter);

startServer(config.msgServerConfig, appMsg, (secure:boolean, host:string, port:number) => {
    let protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway msg server listening at %s://%s:%s', protocol, host, port);
}, (err:any) => {
    console.error(new Date().toISOString() + ': !!! api gateway msg server error: ' + JSON.stringify(err));
    process.exit(1);
});

class ServerMessenger extends events.EventEmitter implements IServerMessenger {
    constructor(private connectionsManager: tr.IConnectionsManager) {
        super();
        this.connectionsManager.on("on_client_send_msg", (req:express.Request, connection: tr.ITopicConnection, params: tr.SendMsgParams) => {
            if (params.destination === '/topic/gateway') {
                let msg:Message = params.body;
                if (msg.type === "ready") {
                    let content: ReadyContent = msg.contnet;
                    let InstanceId = content.InstanceId;
                    connection.cookie = InstanceId;
                    this.emit("instance-launched", InstanceId);
                }
            }
        }).on("client_disconnect", (req:express.Request, connection: tr.ITopicConnection) => {
            let InstanceId: ServerId = connection.cookie;
            this.emit("instance-terminated", InstanceId);
        });
    }
    notifyToTerminate(InstanceId: string): void {
        let msg: Message = {type: "terminate"};
        this.connectionsManager.dispatchMessage("/topic/"+ InstanceId, {}, msg);
    }
}

let stateMachine = sm.get(getServerManager(config.availableApiServerPorts, new ServerMessenger(ConnectionsManager)));
stateMachine.on("ready", () => {    // api server is ready => get the proxy ready
    console.log(new Date().toISOString() + ': state machine reports a <ready> state. starting the api proxy server...');
    let appProxy = express();
    let options: proxy.Options = {
        targetAcquisition: (req: express.Request) => {
            return Promise.resolve<proxy.TargetSettings>({targetUrl: stateMachine.TargetInstanceUrl + "/services"});
        }
    }
    appProxy.use("/services", proxy.get(options));

    startServer(config.proxyServerConfig, appProxy, (secure:boolean, host:string, port:number) => {
        let protocol = (secure ? 'https' : 'http');
        console.log(new Date().toISOString() + ': api gateway proxy server listening at %s://%s:%s', protocol, host, port);
        stateMachine.initialize();
    }, (err:any) => {
        console.error(new Date().toISOString() + ': !!! api gateway proxy server error: ' + JSON.stringify(err));
        process.exit(1);
    });
}).on("change", () => {
    console.log(new Date().toISOString() + ": <<change>> state=" + stateMachine.State);
}).on("error", (err: any) => {
    console.error(new Date().toISOString() + ': !!! Error: ' + JSON.stringify(err));
});

let appAdmin = express();
appAdmin.set('jsonp callback name', 'cb');
appAdmin.use(noCache);
appAdmin.use(bodyParser.json({"limit":"999mb"}));
appAdmin.use(prettyPrinter.get());

let g: IGlobal = {
    stateMachine
};

appAdmin.set("global", g);

appAdmin.use("/services", servicesRouter);

startServer(config.adminServerConfig, appAdmin, (secure:boolean, host:string, port:number) => {
    let protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway admin server listening at %s://%s:%s', protocol, host, port);
    stateMachine.initialize();
}, (err:any) => {
    console.error(new Date().toISOString() + ': !!! api gateway admin server error: ' + JSON.stringify(err));
    process.exit(1);
});