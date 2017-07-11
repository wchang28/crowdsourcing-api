import * as express from 'express';
import {IWebServerConfig, startServer} from 'express-web-server';
import * as rc from "express-req-counter";
import * as rcf from "rcf";
import * as node$ from "rest-node";
import {Message, ReadyContent} from "../message";
import * as af from "./app-factory";

let InstanceId = process.argv[2];
let Port = parseInt(process.argv[3]);
let MsgPort = parseInt(process.argv[4]);
let NODE_PATH = process.env["NODE_PATH"];

console.log("InstanceId=" + InstanceId);
console.log("Port=" + Port);
console.log("MsgPort=" + MsgPort);
console.log("NODE_PATH=" + NODE_PATH);

let terminationPending = false;

let reqCounter = rc.get();
reqCounter.on("zero-count", () => {
    if (terminationPending)
        process.exit(0);
})

function flagTerminationPending() {
    terminationPending = true;
    if (reqCounter.Counter === 0)
        process.exit(0);
}

let appFactory = af.get();

appFactory.on("app-just-created", (app: express.Express) => {
    app.use(reqCounter.Middleware);
});

let app = appFactory.create();

let api = new rcf.AuthorizedRestApi(node$.get(), {instance_url: "http://127.0.0.1:" + MsgPort.toString()});
let msgClient = api.$M("/msg/events/event_stream", {reconnetIntervalMS: 3000});
msgClient.on("connect", (conn_id: string) => {
    console.log(new Date().toISOString() + ": connected :-) conn_id=" + conn_id);
    msgClient.subscribe("/topic/" + InstanceId, (msg: rcf.IMessage) => {
        if (msg.body) {
            let message : Message = msg.body;
            if (message.type === "terminate") {
                flagTerminationPending();
            }
        }
    }).then((sub_id: string) => {
        console.log(new Date().toISOString() + ": topic subscription successful, sub_id=" + sub_id);
        console.log(new Date().toISOString() + ": starting the web server");

        startServer({http:{port: Port, host: "127.0.0.1"}}, app, (secure:boolean, host:string, port:number) => {
            let protocol = (secure ? 'https' : 'http');
            console.log(new Date().toISOString() + ': crowdsourcing api server listening at %s://%s:%s', protocol, host, port);

            let content: ReadyContent = {InstanceId, NODE_PATH};
            let msg: Message = {type: "ready", content};
            msgClient.send("/topic/gateway", {}, msg).then(() => {
                console.log(new Date().toISOString() + ": <<ready>> message sent");
            }).catch((err: any) => {
                console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
                process.exit(1);
            });
        }, (err:any) => {
            console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
            process.exit(1);
        });
    }).catch((err: any) => {
        console.error(new Date().toISOString() + ': !!! Error subscribing to topic: ' + JSON.stringify(err));
        process.exit(1);
    });
}).on("error", (err: any) => {
    console.error(new Date().toISOString() + ': !!! Error: ' + JSON.stringify(err));
});

