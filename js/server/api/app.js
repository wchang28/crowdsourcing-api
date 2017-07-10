"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var express_web_server_1 = require("express-web-server");
var bodyParser = require("body-parser");
var noCache = require("no-cache-express");
var prettyPrinter = require("express-pretty-print");
var rcf = require("rcf");
var node$ = require("rest-node");
var extensions_1 = require("./extensions");
var InstanceId = process.argv[2];
var Port = parseInt(process.argv[3]);
var MsgPort = parseInt(process.argv[4]);
var NODE_PATH = process.env["NODE_PATH"];
console.log("InstanceId=" + InstanceId);
console.log("Port=" + Port);
console.log("MsgPort=" + MsgPort);
console.log("NODE_PATH=" + NODE_PATH);
var app = express();
app.set('jsonp callback name', 'cb');
app.use(noCache);
app.use(bodyParser.text({ "limit": "999mb" }));
app.use(bodyParser.json({ "limit": "999mb" }));
app.use(prettyPrinter.get());
var terminationPending = false;
var count = 0;
function flagTerminationPending() {
    terminationPending = true;
    if (count === 0)
        process.exit(0);
}
function onUsageCountChanged() {
    if (terminationPending && count === 0)
        process.exit(0);
}
app.use(function (req, res, next) {
    count++;
    console.log("\n<<count++>> count=" + count.toString());
    onUsageCountChanged();
    req.on("end", function () {
        console.log("req => <<end>>");
        count--;
        console.log("<<count-->> count=" + count.toString());
        onUsageCountChanged();
    }).on("close", function () {
        console.log("req => <<close>>");
    }).on("error", function (err) {
        console.log("req => <<error>>, err=" + JSON.stringify(err));
    });
    res.on("finish", function () {
        console.log("res => <<finish>>");
    }).on("close", function () {
        console.log("res => <<close>>");
        count--;
        console.log("<<count-->> count=" + count.toString());
        onUsageCountChanged();
    }).on("error", function (err) {
        console.log("res => <<error>>, err=" + JSON.stringify(err));
    });
    next();
});
app.use(function (req, res, next) {
    console.log("\n" + new Date().toISOString() + ': method=' + req.method + ', url=' + req.url + "\nheaders=\n" + JSON.stringify(req.headers, null, 2));
    next();
});
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.options("/*", function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH,HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Content-Length,X-Requested-With');
    res.send(200);
});
function getExpressMethodFunctionBindedToApp(method) {
    var methodFunction = app[method.toLowerCase()];
    return methodFunction.bind(app);
}
var extensionModules = extensions_1.getAllExtensionModules(NODE_PATH);
for (var i in extensionModules) {
    var module_1 = extensionModules[i].module;
    try {
        var moduleExport = require(module_1);
        for (var j in moduleExport) {
            var exportItem = moduleExport[j];
            if (exportItem && exportItem.method && exportItem.pathname && exportItem.requestHandlers && exportItem.requestHandlers.length > 0) {
                var methodFunc = getExpressMethodFunctionBindedToApp(exportItem.method);
                var apiPath = "/services" + exportItem.pathname;
                if (apiPath.substr(apiPath.length - 1, 1) === "/")
                    apiPath = apiPath.substr(0, apiPath.length - 1);
                methodFunc(apiPath, exportItem.requestHandlers);
            }
        }
    }
    catch (e) {
    }
}
/*
app.get("/services/hi", (req: express.Request, res: express.Response) => {
    res.jsonp({msg: "How are you sir?"});
    //setTimeout(() => {res.jsonp({msg: "How are you?"});}, 45000);
});
*/
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
            msgClient.send("/topic/gateway", {}, msg);
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
