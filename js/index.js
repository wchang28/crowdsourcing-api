"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
exports.Router = express_1.Router;
__export(require("rcf"));
var request_data_1 = require("./request-data");
exports.getRequestData = request_data_1.get;
exports.Endware = request_data_1.Endware;
exports.ResourceMiddleware = request_data_1.ResourceMiddleware;
exports.PermissionMiddleware = request_data_1.PermissionMiddleware;
