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
var StateMachine = (function (_super) {
    __extends(StateMachine, _super);
    function StateMachine(serverManager) {
        var _this = _super.call(this) || this;
        _this.serverManager = serverManager;
        _this._currentServer = null;
        _this._newServer = null;
        _this._oldServer = null;
        _this._currentServer = null;
        _this._newServer = null;
        _this._oldServer = null;
        _this._newServerLauncherTimer = null;
        _this._newServerLaunchCompletionCallback = null;
        serverManager.on("instance-launched", function (Instance) {
            if (_this.State === "initializing" || _this.State === "switching") {
                if (_this._newServerLauncherTimer) {
                    clearTimeout(_this._newServerLauncherTimer);
                    _this._newServerLauncherTimer = null;
                }
                if (_this._currentServer === null) {
                    _this._newServer.State = "ready";
                    _this._currentServer = _this._newServer;
                    _this._newServer = null;
                    _this.emit("ready");
                }
                else {
                    _this._oldServer = _this._currentServer;
                    _this._oldServer.State = "terminating";
                    _this._newServer.State = "ready";
                    _this._currentServer = _this._newServer;
                    _this._newServer = null;
                    _this.serverManager.terminateInstance(_this._oldServer.Instance);
                }
                if (typeof _this._newServerLaunchCompletionCallback === "function") {
                    _this._newServerLaunchCompletionCallback(null);
                    _this._newServerLaunchCompletionCallback = null;
                }
                _this.emit("change");
            }
        }).on("instance-terminated", function (Instance) {
            if (_this.State === "switched") {
                _this._oldServer = null;
                // back to "ready"
                _this.emit("change");
            }
        });
        _this.launchNewServer();
        return _this;
    }
    Object.defineProperty(StateMachine.prototype, "State", {
        get: function () {
            if (this._currentServer === null && this._newServer === null && this._oldServer === null)
                return "uninitizlized";
            else if (this._currentServer === null && this._newServer !== null && this._oldServer === null)
                return "initializing";
            else if (this._currentServer !== null && this._newServer === null && this._oldServer === null)
                return "ready";
            else if (this._currentServer !== null && this._newServer !== null && this._oldServer === null)
                return "switching";
            else if (this._currentServer !== null && this._newServer === null && this._oldServer !== null)
                return "switched";
            else
                throw "bad state";
        },
        enumerable: true,
        configurable: true
    });
    StateMachine.prototype.launchNewServer = function () {
        var _this = this;
        if (this.State != "uninitizlized" && this.State != "ready")
            return Promise.reject({ error: "invalid-request", error_description: "not ready" });
        else {
            return this.serverManager.launchNewInstance().then(function (Instance) {
                _this._newServer = { Instance: Instance, State: "initializing" };
                // "initializing" or "switching"
                _this.emit("change");
                _this._newServerLauncherTimer = setTimeout(function () {
                    _this._newServerLauncherTimer = null;
                    _this._newServer = null;
                    // back to "uninitizlized" or "ready"
                    _this.emit("change");
                    var err = { error: "timeout", error_description: "new server launch timeout" };
                    if (typeof _this._newServerLaunchCompletionCallback === "function") {
                        _this._newServerLaunchCompletionCallback(err);
                        _this._newServerLaunchCompletionCallback = null;
                    }
                    _this.emit("error", err);
                }, 60000);
                return Instance;
            });
        }
    };
    StateMachine.prototype.switch = function () {
        var _this = this;
        if (this.State !== "ready")
            return Promise.reject({ error: "invalid-request", error_description: "not ready" });
        else {
            return new Promise(function (resolve, reject) {
                _this.launchNewServer()
                    .then(function (Instance) {
                    _this._newServerLaunchCompletionCallback = function (err) {
                        if (err)
                            reject(err);
                        else
                            resolve({});
                    };
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    };
    Object.defineProperty(StateMachine.prototype, "ServerInstance", {
        get: function () { return (this._currentServer ? this._currentServer.Instance : null); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "CurrentServer", {
        get: function () { return this._currentServer; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "NewServer", {
        get: function () { return this._newServer; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "OldServer", {
        get: function () { return this._oldServer; },
        enumerable: true,
        configurable: true
    });
    StateMachine.prototype.toJSON = function () {
        return {
            State: this.State,
            ServerInstance: this.ServerInstance,
            CurrentServer: this.CurrentServer,
            NewServer: this.NewServer,
            OldServer: this.OldServer
        };
    };
    return StateMachine;
}(events.EventEmitter));
