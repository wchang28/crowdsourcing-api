/// <reference types="express" />
/// <reference types="node" />
import { IRequestData } from "./";
import * as express from "express";
import * as rqd from "request-data";
import { IAuthorizedApiRoute, OAuth2Access } from "rcf";
import { AppGlobal, CGIChildProcessLauncher } from "./app-global";
import { Readable } from "stream";
export interface IRequestData extends rqd.IRequestData<AppGlobal> {
    readonly SelfApiRoute: IAuthorizedApiRoute;
    readonly CGIChildProcessLauncher: CGIChildProcessLauncher;
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute;
}
export declare function getRequestData(req: express.Request): IRequestData;
export declare type JSONEndwareHandler<T> = rqd.JSONEndwareHandler<IRequestData, T>;
export declare type ReadableStreamEndwareHandler = rqd.ReadabeStreamEndwareHandler<IRequestData>;
export declare type ResourceMiddlewareHandler<T> = rqd.ResourceMiddlewareHandler<IRequestData, T>;
export declare type PermissionMiddlewareHandler = rqd.PermissionMiddlewareHandler<IRequestData>;
export declare type CGIEndwareHandler = (rqd: IRequestData) => Promise<Readable>;
export declare function JSONEndware<T>(handler: JSONEndwareHandler<T>): express.RequestHandler;
export declare function ReadableStreamEndware(handler: ReadableStreamEndwareHandler): express.RequestHandler;
export declare function CGIEndware(contentType: string, handler: CGIEndwareHandler): express.RequestHandler;
export declare function ResourceMiddleware<T>(handler: ResourceMiddlewareHandler<T>, storageKey?: string): express.RequestHandler;
export declare function PermissionMiddleware(handler: PermissionMiddlewareHandler): express.RequestHandler;
