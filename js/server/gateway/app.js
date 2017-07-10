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
var msg_1 = require("./msg");
var services_1 = require("./services");
var proxy = require("express-http-proxy");
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
appMsg.use('/msg', msg_1.Router);
express_web_server_1.startServer(config.msgServerConfig, appMsg, function (secure, host, port) {
    var protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway msg server listening at %s://%s:%s', protocol, host, port);
}, function (err) {
    console.error(new Date().toISOString() + ': !!! api gateway msg server error: ' + JSON.stringify(err));
    process.exit(1);
});
var ServerMessenger = (function (_super) {
    __extends(ServerMessenger, _super);
    function ServerMessenger(connectionsManager) {
        var _this = _super.call(this) || this;
        _this.connectionsManager = connectionsManager;
        _this.connectionsManager.on("on_client_send_msg", function (req, connection, params) {
            if (params.destination === '/topic/gateway') {
                var msg = params.body;
                if (msg.type === "ready") {
                    var content = msg.content;
                    var InstanceId = content.InstanceId;
                    connection.cookie = InstanceId;
                    _this.emit("instance-launched", InstanceId);
                }
            }
        }).on("client_disconnect", function (req, connection) {
            var InstanceId = connection.cookie;
            _this.emit("instance-terminated", InstanceId);
        });
        return _this;
    }
    ServerMessenger.prototype.notifyToTerminate = function (InstanceId) {
        var msg = { type: "terminate" };
        this.connectionsManager.dispatchMessage("/topic/" + InstanceId, {}, msg);
    };
    return ServerMessenger;
}(events.EventEmitter));
var stateMachine = sm.get(server_mgr_1.get(config.availableApiServerPorts, new ServerMessenger(msg_1.ConnectionsManager), config.msgServerConfig.http.port));
stateMachine.on("ready", function () {
    console.log(new Date().toISOString() + ': state machine reports a <ready> state. starting the api proxy server...');
    var appProxy = express();
    var targetAcquisition = function (req) { return Promise.resolve({ targetUrl: stateMachine.TargetInstanceUrl + "/services" }); };
    appProxy.use("/services", proxy.get({ targetAcquisition: targetAcquisition }));
    express_web_server_1.startServer(config.proxyServerConfig, appProxy, function (secure, host, port) {
        var protocol = (secure ? 'https' : 'http');
        console.log(new Date().toISOString() + ': api gateway proxy server listening at %s://%s:%s', protocol, host, port);
    }, function (err) {
        console.error(new Date().toISOString() + ': !!! api gateway proxy server error: ' + JSON.stringify(err));
        process.exit(1);
    });
}).on("change", function () {
    console.log(new Date().toISOString() + ": <<change>> state=" + stateMachine.State);
}).on("error", function (err) {
    console.error(new Date().toISOString() + ': !!! Error: ' + JSON.stringify(err));
});
var appAdmin = express();
appAdmin.set('jsonp callback name', 'cb');
appAdmin.use(noCache);
appAdmin.use(bodyParser.json({ "limit": "999mb" }));
appAdmin.use(prettyPrinter.get());
var g = {
    stateMachine: stateMachine
};
appAdmin.set("global", g);
appAdmin.use("/services", services_1.Router);
express_web_server_1.startServer(config.adminServerConfig, appAdmin, function (secure, host, port) {
    var protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': api gateway admin server listening at %s://%s:%s', protocol, host, port);
    stateMachine.initialize();
}, function (err) {
    console.error(new Date().toISOString() + ': !!! api gateway admin server error: ' + JSON.stringify(err));
    process.exit(1);
});
