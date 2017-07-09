"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var express_web_server_1 = require("express-web-server");
var bodyParser = require("body-parser");
var noCache = require("no-cache-express");
var prettyPrinter = require("express-pretty-print");
var fs = require("fs");
var path = require("path");
var configFile = null;
if (process.argv.length < 3)
    configFile = path.join(__dirname, "../../../configs/local-testing-config.json");
else
    configFile = process.argv[2];
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
var appMsg = express();
appMsg.set('jsonp callback name', 'cb');
appMsg.use(noCache);
appMsg.use(bodyParser.json({ "limit": "999mb" }));
appMsg.use(prettyPrinter.get());
express_web_server_1.startServer(config.msgServerConfig, appMsg, function (secure, host, port) {
    var protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway msg server listening at %s://%s:%s', protocol, host, port);
}, function (err) {
    console.error(new Date().toISOString() + ': !!! api gateway msg server error: ' + JSON.stringify(err));
    process.exit(1);
});
/*
let stateMachine = sm.get(getServerManager(config.availableApiServerPorts, null));
stateMachine.on("ready", () => {    // api server is ready => get the proxy ready
    let appProxy = express();

});
*/
var appAdmin = express();
appAdmin.set('jsonp callback name', 'cb');
appAdmin.use(noCache);
appAdmin.use(bodyParser.json({ "limit": "999mb" }));
appAdmin.use(prettyPrinter.get());
express_web_server_1.startServer(config.adminServerConfig, appAdmin, function (secure, host, port) {
    var protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway admin server listening at %s://%s:%s', protocol, host, port);
    //stateMachine.initialize();
}, function (err) {
    console.error(new Date().toISOString() + ': !!! api gateway admin server error: ' + JSON.stringify(err));
    process.exit(1);
});
