"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var express_web_server_1 = require("express-web-server");
var bodyParser = require("body-parser");
var noCache = require("no-cache-express");
var prettyPrinter = require("express-pretty-print");
var app = express();
app.set('jsonp callback name', 'cb');
app.use(noCache);
app.use(bodyParser.text({ "limit": "999mb" }));
app.use(bodyParser.json({ "limit": "999mb" }));
app.use(prettyPrinter.get());
var count = 0;
app.use(function (req, res, next) {
    count++;
    console.log("\n<<count++>> count=" + count.toString());
    req.on("end", function () {
        console.log("req => <<end>>");
        count--;
        console.log("<<count-->> count=" + count.toString());
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
//console.log("env=\n" + JSON.stringify(process.env, null, 2) + "\n");
console.log("NODE_PATH=" + process.env["NODE_PATH"]);
var uuid = require("uuid");
console.log(uuid.v4());
var mod_id = require.resolve("uuid");
console.log("mod_id=" + mod_id);
var mod = (require.cache[mod_id]);
console.log(mod.filename);
app.get("/hi", function (req, res) {
    setTimeout(function () {
        res.jsonp({ msg: "How are you?" });
    }, 10000);
});
//app.set("global", g);
//app.use('/services', servicesRouter);
express_web_server_1.startServer({ http: { port: 8745, host: "127.0.0.1" } }, app, function (secure, host, port) {
    var protocol = (secure ? 'https' : 'http');
    console.log(new Date().toISOString() + ': crowdsourcing api server listening at %s://%s:%s', protocol, host, port);
}, function (err) {
    console.error(new Date().toISOString() + ': !!! crowdsourcing api server error: ' + JSON.stringify(err));
    process.exit(1);
});
