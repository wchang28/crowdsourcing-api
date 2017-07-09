"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// route /msg
var express = require("express");
var tr = require("rcf-message-router");
var router = express.Router();
exports.Router = router;
var destAuthRouter = express.Router();
destAuthRouter.post("/topic/gateway", tr.destAuth(function (req, res) {
    res.accept();
}));
var options = {
    connKeepAliveIntervalMS: 10000,
    dispatchMsgOnClientSend: false,
    destinationAuthorizeRouter: destAuthRouter
};
var ret = tr.get('/', options);
router.use('/events', ret.router); // topic subscription endpoint is available at /events from this route
var connectionsManager = ret.connectionsManager;
exports.ConnectionsManager = connectionsManager;
connectionsManager.on('client_connect', function (req, connection) {
    console.log('client ' + connection.id + ' @ ' + connection.remoteAddress + ' connected to the SSE topic endpoint');
}).on('client_disconnect', function (req, connection) {
    console.log('client ' + connection.id + ' @ ' + connection.remoteAddress + ' disconnected from the SSE topic endpoint');
});
