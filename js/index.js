"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var request_data_1 = require("./request-data");
var express_1 = require("express");
exports.Router = express_1.Router;
__export(require("rcf"));
function getRequestData(req) { return new request_data_1.RequestData(req); }
exports.getRequestData = getRequestData;
