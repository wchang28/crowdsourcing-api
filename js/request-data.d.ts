/// <reference types="express" />
import { IRequestData } from "./";
import * as express from "express";
import * as rqd from "request-data";
import { IAuthorizedApiRoute, OAuth2Access } from "rcf";
import { AppGlobal } from "./app-global";
export interface IRequestData extends rqd.IRequestData<AppGlobal> {
    readonly SelfApiRoute: IAuthorizedApiRoute;
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute;
}
export declare class RequestData extends rqd.RequestData<AppGlobal> implements IRequestData {
    constructor(req: express.Request);
    readonly SelfApiRoute: IAuthorizedApiRoute;
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute;
}
export declare function get(req: express.Request): IRequestData;
export declare type EndwareHandler<T> = rqd.EndwareHandler<IRequestData, T>;
export declare type ResourceMiddlewareHandler<T> = rqd.ResourceMiddlewareHandler<IRequestData, T>;
export declare type PermissionMiddlewareHandler = rqd.PermissionMiddlewareHandler<IRequestData>;
export declare function Endware<T>(handler: EndwareHandler<T>): express.RequestHandler;
export declare function ResourceMiddleware<T>(handler: ResourceMiddlewareHandler<T>, storageKey?: string): express.RequestHandler;
export declare function PermissionMiddleware(handler: PermissionMiddlewareHandler): express.RequestHandler;
