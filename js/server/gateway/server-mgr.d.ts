import * as sm from "./state-machine";
export interface IServerMessenger {
    notifyToTerminate(InstanceId: string): void;
    on(event: "instance-launched", listener: (InstanceId: sm.ServerId) => void): this;
    on(event: "instance-terminated", listener: (InstanceId: sm.ServerId) => void): this;
}
export declare function get(availablePorts: [number, number], serverMessenger: IServerMessenger): sm.IServerManager;
