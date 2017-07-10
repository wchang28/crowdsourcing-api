import { ServerId } from "../message";
export declare type State = "uninitizlized" | "initializing" | "ready" | "switching" | "switched";
export declare type ServerState = "initializing" | "ready" | "terminating";
export interface ServerInstance {
    Id: ServerId;
    InstanceUrl: string;
}
export interface Server extends ServerInstance {
    State: ServerState;
}
export interface IServerManager {
    launchNewInstance(): Promise<ServerInstance>;
    terminateInstance(InstanceId: ServerId): void;
    on(event: "instance-launched", listener: (InstanceId: ServerId) => void): this;
    on(event: "instance-terminated", listener: (InstanceId: ServerId) => void): this;
}
export interface StateMachineJSON {
    State: State;
    TargetInstanceUrl: string;
    CurrentServer: Server;
    NewServer: Server;
    OldServer: Server;
}
export interface IStateMachine {
    readonly State: State;
    initialize(): Promise<ServerInstance>;
    deploy(): Promise<any>;
    readonly TargetInstanceUrl: string;
    readonly CurrentServer: Server;
    readonly NewServer: Server;
    readonly OldServer: Server;
    toJSON(): StateMachineJSON;
    on(event: "change", listener: () => void): this;
    on(event: "ready", listener: () => void): this;
    on(event: "error", listener: (err: any) => void): this;
}
export declare function get(serverManager: IServerManager): IStateMachine;
