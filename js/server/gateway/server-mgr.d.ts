import * as sm from "./state-machine";
import { ServerId } from "./message";
export interface IServerMessenger {
    notifyToTerminate(InstanceId: string): void;
    on(event: "instance-launched", listener: (InstanceId: ServerId) => void): this;
    on(event: "instance-terminated", listener: (InstanceId: ServerId) => void): this;
}
export declare function get(availablePorts: [number, number], serverMessenger: IServerMessenger): sm.IServerManager;
