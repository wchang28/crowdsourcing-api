"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var express_web_server_1 = require("express-web-server");
var bodyParser = require("body-parser");
var noCache = require("no-cache-express");
var prettyPrinter = require("express-pretty-print");
var fs = require("fs");
var path = require("path");
var events = require("events");
var server_mgr_1 = require("./server-mgr");
var sm = require("./state-machine");
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
    notifyToTerminate(InstanceId: string): void;
    on(event: "instance-launched", listener: (InstanceId: sm.ServerId) => void) : this;
    on(event: "instance-terminated", listener: (InstanceId: sm.ServerId) => void): this;
*/
var ServerMessenger = (function (_super) {
    __extends(ServerMessenger, _super);
    function ServerMessenger() {
        return _super.call(this) || this;
    }
    ServerMessenger.prototype.notifyToTerminate = function (InstanceId) {
    };
    return ServerMessenger;
}(events.EventEmitter));
var stateMachine = sm.get(server_mgr_1.get(config.availableApiServerPorts, new ServerMessenger()));
stateMachine.on("ready", function () {
    var appProxy = express();
});
var appAdmin = express();
appAdmin.set('jsonp callback name', 'cb');
appAdmin.use(noCache);
appAdmin.use(bodyParser.json({ "limit": "999mb" }));
appAdmin.use(prettyPrinter.get());
express_web_server_1.startServer(config.adminServerConfig, appAdmin, function (secure, host, port) {
    var protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway admin server listening at %s://%s:%s', protocol, host, port);
    stateMachine.initialize();
}, function (err) {
    console.error(new Date().toISOString() + ': !!! api gateway admin server error: ' + JSON.stringify(err));
    process.exit(1);
});
