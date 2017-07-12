"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_web_server_1 = require("express-web-server");
var rc = require("express-req-counter");
var rcf = require("rcf");
var node$ = require("rest-node");
var af = require("./app-factory");
var NODE_PATH = process.env["NODE_PATH"];
var Mode = null;
var Port = (process.argv.length >= 3 ? parseInt(process.argv[2]) : 80);
var MsgPort = null;
var InstanceId = null;
if (process.argv.length >= 4) {
    Mode = "deploy";
    MsgPort = parseInt(process.argv[3]);
    InstanceId = process.argv[4];
}
else
    Mode = "debug";
console.log("NODE_PATH=" + NODE_PATH);
console.log("Mode=" + Mode);
console.log("Port=" + Port);
if (Mode === "deploy") {
    console.log("MsgPort=" + MsgPort);
    console.log("InstanceId=" + InstanceId);
}
function startApiAppServer(appFactory, port, callback) {
    console.log(new Date().toISOString() + ": starting the crowdsourcing api server...");
    express_web_server_1.startServer({ http: { port: port, host: "127.0.0.1" } }, appFactory.create(), function (secure, host, port) {
        var protocol = (secure ? 'https' : 'http');
        console.log(new Date().toISOString() + ': crowdsourcing api server listening at %s://%s:%s', protocol, host, port);
        if (typeof callback === "function")
            callback();
    }, function (err) {
        console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
        process.exit(1);
    });
}
var terminationPending = false;
var reqCounter = rc.get();
function flagTerminationPending() {
    terminationPending = true;
    if (reqCounter.Counter === 0)
        process.exit(0);
}
reqCounter.on("zero-count", function () {
    if (terminationPending)
        process.exit(0);
});
var appFactory = af.get({ SelfPort: Port });
if (Mode === "deploy") {
    appFactory.on("app-just-created", function (app) {
        app.use(reqCounter.Middleware); // install the request counter middleware to app
    });
    console.log(new Date().toISOString() + ": connecting to the gateway msg server...");
    var api = new rcf.AuthorizedRestApi(node$.get(), { instance_url: "http://127.0.0.1:" + MsgPort.toString() });
    var msgClient_1 = api.$M("/msg/events", { reconnetIntervalMS: 3000 });
    msgClient_1.on("connect", function (conn_id) {
        console.log(new Date().toISOString() + ": connected to the gateway msg server :-) conn_id=" + conn_id);
        msgClient_1.subscribe("/topic/" + InstanceId, function (msg) {
            if (msg.body) {
                var message = msg.body;
                if (message.type === "terminate") {
                    flagTerminationPending();
                }
            }
        }).then(function (sub_id) {
            console.log(new Date().toISOString() + ": topic subscription successful, sub_id=" + sub_id);
            startApiAppServer(appFactory, Port, function () {
                var content = { InstanceId: InstanceId, NODE_PATH: NODE_PATH };
                var msg = { type: "ready", content: content };
                msgClient_1.send("/topic/gateway", {}, msg).then(function () {
                    console.log(new Date().toISOString() + ": <<ready>> message sent");
                }).catch(function (err) {
                    console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
                    process.exit(1);
                });
            });
        }).catch(function (err) {
            console.error(new Date().toISOString() + ': !!! Error subscribing to topic: ' + JSON.stringify(err));
            process.exit(1);
        });
    }).on("error", function (err) {
        console.error(new Date().toISOString() + ': !!! Error: ' + JSON.stringify(err));
    }).on("ping", function () {
        console.log(new Date().toISOString() + ": <<PING>>");
    });
}
else
    startApiAppServer(appFactory, Port);
