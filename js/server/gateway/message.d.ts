export declare type ServerId = string;
export declare type MsgType = "ready" | "terminate";
export interface ReadyContent {
    InstanceId: ServerId;
}
export interface Message {
    type: MsgType;
    contnet?: any;
}
