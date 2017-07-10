import * as events from "events";
import * as sm from "./state-machine";
import * as uuid from "uuid";
import * as cp from "child_process"; 
import * as path from 'path';
import {ServerId} from "./message";

export interface IServerMessenger {
    notifyToTerminate(InstanceId: string): void;
    on(event: "instance-launched", listener: (InstanceId: ServerId) => void) : this;
    on(event: "instance-terminated", listener: (InstanceId: ServerId) => void): this;
}

interface PortItem {
    Port: number;
    InstanceId: ServerId;
}

class ServerManager extends events.EventEmitter implements sm.IServerManager {
    private _ports: [PortItem, PortItem];
    constructor(availablePorts: [number, number], private serverMessenger: IServerMessenger, private msgPort: number) {
        super();
        this._ports = [{Port:availablePorts[0], InstanceId: null}, {Port:availablePorts[1], InstanceId: null}];
        this.serverMessenger.on("instance-launched", (InstanceId: ServerId) => {
            this.emit("instance-launched", InstanceId);
        }).on("instance-terminated", (InstanceId: ServerId) => {
            for (let i in this._ports) {
                if (this._ports[i].InstanceId === InstanceId) {
                    this._ports[i].InstanceId = null;
                    break;
                }
            }
            this.emit("instance-terminated", InstanceId);
        })
    }
    private useAvailablePort(InstanceId: ServerId) : number {
        let index = (!this._ports[0].InstanceId ? 0 : 1);
        this._ports[index].InstanceId = InstanceId;
        return this._ports[index].Port;
    }
    private launchInstance(InstanceId: ServerId, Port: number) : Promise<any> {
        let apiAppScript = path.join(__dirname, "../api/app.js");
        cp.spawn("node.exe", [apiAppScript, InstanceId, Port.toString(), this.msgPort.toString()], {env: {"NODE_PATH": "C:\\test\\node_modules"}});
        //cp.spawn("node.exe", [apiAppScript, InstanceId, Port.toString(), this.msgPort.toString()]);
        return Promise.resolve<any>(null);
    }
    launchNewInstance() : Promise<sm.ServerInstance> {
        let InstanceId = uuid.v4();
        let Port = this.useAvailablePort(InstanceId);
        let InstanceUrl = "http://127.0.0.1:" + Port.toString();
        let ServerInstnace: sm.ServerInstance = {Id: InstanceId, InstanceUrl};
        return this.launchInstance(InstanceId, Port).then(() => Promise.resolve<sm.ServerInstance>(ServerInstnace));  
    }
    terminateInstance(InstanceId: string) : void {this.serverMessenger.notifyToTerminate(InstanceId);}
}

export function get(availablePorts: [number, number], serverMessenger: IServerMessenger, msgPort: number) : sm.IServerManager {return new ServerManager(availablePorts, serverMessenger, msgPort);}