export declare type ServerId = string;
export declare type MsgType = "ready" | "terminate";
export interface ReadyContent {
    InstanceId: ServerId;
    NODE_PATH?: string;
}
export interface Message {
    type: MsgType;
    content?: any;
}
