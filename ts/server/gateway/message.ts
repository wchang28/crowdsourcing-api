export type ServerId = string;

export type MsgType = "ready" | "terminate";

export interface ReadyContent {
    InstanceId: ServerId;
}

export interface Message {
    type: MsgType;
    content?: any;
}