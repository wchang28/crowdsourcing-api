"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// route /services
var express = require("express");
var request_data_1 = require("../request-data");
var router = express.Router();
exports.Router = router;
router.get("/", request_data_1.RequestData.Endware(function (rqd) { return Promise.resolve(rqd.StateMachine.toJSON()); }));
router.get("/state", request_data_1.RequestData.Endware(function (rqd) { return Promise.resolve(rqd.StateMachine.State); }));
router.get("/deploy", request_data_1.RequestData.Endware(function (rqd) { return rqd.StateMachine.deploy(); }));
