"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_web_server_1 = require("express-web-server");
var rc = require("express-req-counter");
var rcf = require("rcf");
var node$ = require("rest-node");
var af = require("./app-factory");
var InstanceId = process.argv[2];
var Port = parseInt(process.argv[3]);
var MsgPort = parseInt(process.argv[4]);
var NODE_PATH = process.env["NODE_PATH"];
console.log("InstanceId=" + InstanceId);
console.log("Port=" + Port);
console.log("MsgPort=" + MsgPort);
console.log("NODE_PATH=" + NODE_PATH);
var terminationPending = false;
var reqCounter = rc.get();
reqCounter.on("zero-count", function () {
    if (terminationPending)
        process.exit(0);
});
function flagTerminationPending() {
    terminationPending = true;
    if (reqCounter.Counter === 0)
        process.exit(0);
}
var appFactory = af.get();
appFactory.on("app-just-created", function (app) {
    app.use(reqCounter.Middleware);
});
var app = appFactory.create();
var api = new rcf.AuthorizedRestApi(node$.get(), { instance_url: "http://127.0.0.1:" + MsgPort.toString() });
var msgClient = api.$M("/msg/events/event_stream", { reconnetIntervalMS: 3000 });
msgClient.on("connect", function (conn_id) {
    msgClient.subscribe("/topic/" + InstanceId, function (msg) {
        if (msg.body) {
            var message = msg.body;
            if (message.type === "terminate") {
                flagTerminationPending();
            }
        }
    }).then(function (sub_id) {
        console.log(new Date().toISOString() + ": topic subscription successful, sub_id=" + sub_id);
        console.log(new Date().toISOString() + ": starting the web server");
        express_web_server_1.startServer({ http: { port: Port, host: "127.0.0.1" } }, app, function (secure, host, port) {
            var protocol = (secure ? 'https' : 'http');
            console.log(new Date().toISOString() + ': crowdsourcing api server listening at %s://%s:%s', protocol, host, port);
            var content = { InstanceId: InstanceId, NODE_PATH: NODE_PATH };
            var msg = { type: "ready", content: content };
            msgClient.send("/topic/gateway", {}, msg).then(function () {
                console.log(new Date().toISOString() + ": <<ready>> message sent");
            }).catch(function (err) {
                console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
                process.exit(1);
            });
        }, function (err) {
            console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
            process.exit(1);
        });
    }).catch(function (err) {
        console.error(new Date().toISOString() + ': !!! Error subscribing to topic: ' + JSON.stringify(err));
        process.exit(1);
    });
}).on("error", function (err) {
    console.error(new Date().toISOString() + ': !!! Error: ' + JSON.stringify(err));
});
