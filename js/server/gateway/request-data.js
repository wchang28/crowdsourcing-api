"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestData = (function () {
    function RequestData(req) {
        this.req = req;
        if (!req["request_info"])
            req["request_info"] = {};
    }
    Object.defineProperty(RequestData.prototype, "RequestInfo", {
        get: function () { return this.req["request_info"]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "Global", {
        get: function () { return this.req.app.get("global"); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "Headers", {
        get: function () { return this.req.headers; },
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
    RequestData.Endware = function (handler) {
        return function (req, res) {
            handler(new RequestData(req))
                .then(function (value) {
                res.jsonp(value);
            }).catch(function (err) {
                res.status(err.code ? err.code : 400).json(err);
            });
        };
    };
    Object.defineProperty(RequestData.prototype, "StateMachine", {
        get: function () { return this.Global.stateMachine; },
        enumerable: true,
        configurable: true
    });
    return RequestData;
}());
exports.RequestData = RequestData;
