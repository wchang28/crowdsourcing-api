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
// app factory for the crowdsourcing api server
var events = require("events");
var express = require("express");
var bodyParser = require("body-parser");
var noCache = require("no-cache-express");
var prettyPrinter = require("express-pretty-print");
var extensions_1 = require("../extensions");
;
var APIAppFactory = (function (_super) {
    __extends(APIAppFactory, _super);
    function APIAppFactory(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    APIAppFactory.prototype.create = function () {
        var NODE_PATH = process.env["NODE_PATH"];
        if (!NODE_PATH)
            throw "env['NODE_PATH'] is not set";
        var app = express();
        this.emit("app-just-created", app);
        /*
        app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            req.connection.setTimeout(20000);
            next();
        });
        */
        app.set('jsonp callback name', 'cb');
        app.use(noCache);
        app.use(bodyParser.text({ "limit": "999mb" }));
        app.use(bodyParser.json({ "limit": "999mb" }));
        app.use(prettyPrinter.get());
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
        var serviceRouter = express.Router();
        var extensionModules = extensions_1.getAllExtensionModules(NODE_PATH);
        for (var i in extensionModules) {
            var module_1 = extensionModules[i].module;
            try {
                var moduleExport = require(module_1);
                var moduleRouter = express.Router();
                serviceRouter.use("/" + module_1, moduleRouter);
                moduleExport.init(moduleRouter);
            }
            catch (e) {
            }
        }
        app.use("/services", serviceRouter);
        return app;
    };
    return APIAppFactory;
}(events.EventEmitter));
function get(options) { return new APIAppFactory(options); }
exports.get = get;
