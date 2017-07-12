"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rcf_1 = require("rcf");
var $node = require("rest-node");
var RequestData = (function () {
    function RequestData(req) {
        this.req = req;
        if (!this.req["__request_info__"])
            this.req["__request_info__"] = {};
    }
    Object.defineProperty(RequestData.prototype, "RequestInfo", {
        get: function () { return this.req["__request_info__"]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "Global", {
        get: function () { return this.req.app.get("global"); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "Query", {
        get: function () { return this.req.query; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "Params", {
        get: function () { return this.req.params; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "Body", {
        get: function () { return this.req.body; },
        enumerable: true,
        configurable: true
    });
    RequestData.prototype.get = function (field) { return (this.RequestInfo)[field]; };
    RequestData.prototype.set = function (field, value) { (this.RequestInfo)[field] = value; };
    Object.defineProperty(RequestData.prototype, "SelfApiRoute", {
        get: function () { return this.Global.selfApiRoute; },
        enumerable: true,
        configurable: true
    });
    RequestData.prototype.getRestApiRoute = function (access) { return new rcf_1.AuthorizedRestApi($node.get(), access).mount("/"); };
    return RequestData;
}());
exports.RequestData = RequestData;
