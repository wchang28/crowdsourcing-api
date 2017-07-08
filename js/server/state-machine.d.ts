export declare type State = "uninitizlized" | "initializing" | "ready" | "switching" | "switched";
export declare type ServerState = "initializing" | "ready" | "terminating";
export declare type ServerInstance = string;
export interface Server {
    Instance: ServerInstance;
    State: ServerState;
}
export interface IServerManager {
    launchNewInstance(): Promise<ServerInstance>;
    terminateInstance(Instance: ServerInstance): void;
    on(event: "instance-launched", listener: (Instance: ServerInstance) => void): any;
    on(event: "instance-terminated", listener: (Instance: ServerInstance) => void): any;
}
export interface StateMachineJSON {
    State: State;
    ServerInstance: ServerInstance;
    CurrentServer: Server;
    NewServer: Server;
    OldServer: Server;
}
export interface IStateMachine {
    readonly State: State;
    switch(): Promise<any>;
    readonly ServerInstance: ServerInstance;
    readonly CurrentServer: Server;
    readonly NewServer: Server;
    readonly OldServer: Server;
    toJSON(): StateMachineJSON;
    on(event: "change", listener: () => void): this;
    on(event: "ready", listener: () => void): this;
    on(event: "error", listener: (err: any) => void): this;
}
