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
    Object.defineProperty(RequestData.prototype, "SelfApiRoute", {
        get: function () { return this.Global.selfApiRoute; },
        enumerable: true,
        configurable: true
    });
    RequestData.prototype.getRestApiRoute = function (access) { return new rcf_1.AuthorizedRestApi($node.get(), access).mount("/"); };
    return RequestData;
}(rqd.RequestData));
function getRequestData(req) { return new RequestData(req); }
exports.getRequestData = getRequestData;
function Endware(handler) {
    return rqd.EndwareTemplete(function (req) { return new RequestData(req); }, handler);
}
exports.Endware = Endware;
function ResourceMiddleware(handler, storageKey) {
    return rqd.ResourceMiddlewareTemplete(function (req) { return new RequestData(req); }, handler, storageKey);
}
exports.ResourceMiddleware = ResourceMiddleware;
function PermissionMiddleware(handler) {
    return rqd.PermissionMiddlewareTemplete(function (req) { return new RequestData(req); }, handler);
}
exports.PermissionMiddleware = PermissionMiddleware;
