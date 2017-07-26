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
var rqd = require("request-data");
var rcf_1 = require("rcf");
var $node = require("rest-node");
var RequestData = (function (_super) {
    __extends(RequestData, _super);
    function RequestData(req) {
        return _super.call(this, req) || this;
    }
    Object.defineProperty(RequestData.prototype, "ThisModule", {
        get: function () { return this.get("__ThisExtension__"); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "SelfApiRoute", {
        get: function () { return this.get("__SelfApiRoute__"); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "CGIChildProcessLauncher", {
        get: function () { return this.Global.cgiChildProcessLauncher; },
        enumerable: true,
        configurable: true
    });
    RequestData.prototype.getRestApiRoute = function (access) { return new rcf_1.AuthorizedRestApi($node.get(), access).mount("/"); };
    return RequestData;
}(rqd.RequestData));
function getRequestData(req) { return new RequestData(req); }
exports.getRequestData = getRequestData;
var factory = function (req) { return new RequestData(req); };
function JSONEndware(handler) {
    return rqd.JSONEndwareTemplete(factory, handler);
}
exports.JSONEndware = JSONEndware;
function ReadableStreamEndware(handler) {
    return rqd.ReadableStreamEndwareTemplete(factory, handler);
}
exports.ReadableStreamEndware = ReadableStreamEndware;
function CGIEndware(contentType, handler) {
    var h = function (rqd) {
        return handler(rqd).then(function (stdout) {
            var content = {
                info: {
                    type: contentType
                },
                readable: stdout
            };
            return content;
        });
    };
    return ReadableStreamEndware(h);
}
exports.CGIEndware = CGIEndware;
function ResourceMiddleware(handler, storageKey) {
    return rqd.ResourceMiddlewareTemplete(factory, handler, storageKey);
}
exports.ResourceMiddleware = ResourceMiddleware;
function PermissionMiddleware(handler) {
    return rqd.PermissionMiddlewareTemplete(factory, handler);
}
exports.PermissionMiddleware = PermissionMiddleware;
