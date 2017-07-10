import * as express from 'express';
import {IWebServerConfig, startServer} from 'express-web-server';
import * as bodyParser from "body-parser";
import noCache = require('no-cache-express');
import * as prettyPrinter from 'express-pretty-print';
import * as rcf from "rcf";
import * as node$ from "rest-node";
import {Message, ReadyContent} from "../gateway/message";

let InstanceId = process.argv[2];
let Port = parseInt(process.argv[3]);
let MsgPort = parseInt(process.argv[4]);
let NODE_PATH = process.env["NODE_PATH"];

console.log("InstanceId=" + InstanceId);
console.log("Port=" + Port);
console.log("MsgPort=" + MsgPort);
console.log("NODE_PATH=" + NODE_PATH);

let app = express();

app.set('jsonp callback name', 'cb');

app.use(noCache);
app.use(bodyParser.text({"limit":"999mb"}));
app.use(bodyParser.json({"limit":"999mb"}));
app.use(prettyPrinter.get());

let terminationPending = false;
let count = 0;

function flagTerminationPending() {
    terminationPending = true;
    if (count === 0)
        process.exit(0);
}

function onUsageCountChanged() {
    if (terminationPending && count === 0)
        process.exit(0);
}

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    count++;
    console.log("\n<<count++>> count=" + count.toString());
    onUsageCountChanged();
    req.on("end", () => {
        console.log("req => <<end>>");
        count--;
        console.log("<<count-->> count=" + count.toString());
        onUsageCountChanged();
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
        onUsageCountChanged();
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

/*
const uuid = require("uuid");
console.log(uuid.v4());
*/

app.get("/services/hi", (req: express.Request, res: express.Response) => {
    res.jsonp({msg: "How are you sir?"});
    //setTimeout(() => {res.jsonp({msg: "How are you?"});}, 45000);
});

//app.use('/services', servicesRouter);

let api = new rcf.AuthorizedRestApi(node$.get(), {instance_url: "http://127.0.0.1:" + MsgPort.toString()});
let msgClient = api.$M("/msg/events/event_stream", {reconnetIntervalMS: 3000});
msgClient.on("connect", (conn_id: string) => {
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
            msgClient.send("/topic/gateway", {}, msg);
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

