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
var events = require("events");
var uuid = require("uuid");
var cp = require("child_process");
var path = require("path");
var ServerManager = (function (_super) {
    __extends(ServerManager, _super);
    function ServerManager(availablePorts, msgPort, NODE_PATH, serverMessenger) {
        var _this = _super.call(this) || this;
        _this.msgPort = msgPort;
        _this.NODE_PATH = NODE_PATH;
        _this.serverMessenger = serverMessenger;
        _this._ports = [{ Port: availablePorts[0], InstanceId: null }, { Port: availablePorts[1], InstanceId: null }];
        _this.serverMessenger.on("instance-launched", function (InstanceId) {
            _this.emit("instance-launched", InstanceId);
        }).on("instance-terminated", function (InstanceId) {
            for (var i in _this._ports) {
                if (_this._ports[i].InstanceId === InstanceId) {
                    _this._ports[i].InstanceId = null;
                    break;
                }
            }
            _this.emit("instance-terminated", InstanceId);
        });
        return _this;
    }
    ServerManager.prototype.useAvailablePort = function (InstanceId) {
        var index = (!this._ports[0].InstanceId ? 0 : 1);
        this._ports[index].InstanceId = InstanceId;
        return this._ports[index].Port;
    };
    ServerManager.prototype.launchInstance = function (InstanceId, Port) {
        var apiAppScript = path.join(__dirname, "../api/app.js");
        //cp.spawn("node", [apiAppScript, InstanceId, Port.toString(), this.msgPort.toString()], {env: {"NODE_PATH": this.NODE_PATH}});
        cp.spawn("c:\\run\\cmd\\helper.bat", [apiAppScript, InstanceId, Port.toString(), this.msgPort.toString()], { env: { "NODE_PATH": this.NODE_PATH } });
        return Promise.resolve(null);
    };
    ServerManager.prototype.launchNewInstance = function () {
        var InstanceId = uuid.v4();
        var Port = this.useAvailablePort(InstanceId);
        var InstanceUrl = "http://127.0.0.1:" + Port.toString();
        var ServerInstnace = { Id: InstanceId, InstanceUrl: InstanceUrl };
        return this.launchInstance(InstanceId, Port).then(function () { return Promise.resolve(ServerInstnace); });
    };
    ServerManager.prototype.terminateInstance = function (InstanceId) { this.serverMessenger.notifyToTerminate(InstanceId); };
    return ServerManager;
}(events.EventEmitter));
function get(availablePorts, msgPort, NODE_PATH, serverMessenger) { return new ServerManager(availablePorts, msgPort, NODE_PATH, serverMessenger); }
exports.get = get;
