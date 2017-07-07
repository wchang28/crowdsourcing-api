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
    configFile = path.join(__dirname, "../../configs/local-testing-config.json");
else
    configFile = process.argv[2];
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
var app = express();
app.set('jsonp callback name', 'cb');
app.use(noCache);
app.use(bodyParser.text({ "limit": "999mb" }));
app.use(bodyParser.json({ "limit": "999mb" }));
app.use(prettyPrinter.get());
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
//app.set("global", g);
//app.use('/services', servicesRouter);
express_web_server_1.startServer(config.webServerConfig, app, function (secure, host, port) {
    var protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': crowdsourcing api server listening at %s://%s:%s', protocol, host, port);
}, function (err) {
    console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
    process.exit(1);
});
