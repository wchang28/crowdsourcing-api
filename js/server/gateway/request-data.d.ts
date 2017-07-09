/// <reference types="express" />
/// <reference types="node" />
import * as express from 'express';
import { IGlobal } from "./global";
import * as http from "http";
import { IStateMachine } from "./state-machine";
export declare type EndwareHandler<T> = (rqd: RequestData) => Promise<T>;
export declare class RequestData {
    req: express.Request;
    constructor(req: express.Request);
    private readonly RequestInfo;
    readonly Global: IGlobal;
    readonly Headers: http.IncomingMessageHeaders;
    readonly Params: any;
    readonly Body: any;
    static Endware<T>(handler: EndwareHandler<T>): express.RequestHandler;
    readonly StateMachine: IStateMachine;
}
