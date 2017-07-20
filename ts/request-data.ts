import {IRequestData} from "./";
import * as express from "express";
import * as rqd from "request-data";
import {IAuthorizedApiRoute, AuthorizedRestApi, OAuth2Access} from "rcf";
import {AppGlobal} from "./app-global";
import * as $node from "rest-node";

export interface IRequestData extends rqd.IRequestData<AppGlobal> {
    readonly SelfApiRoute: IAuthorizedApiRoute;
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute;
}

export class RequestData extends rqd.RequestData<AppGlobal> implements IRequestData {
    constructor(req: express.Request) {
        super(req);
    }
    get SelfApiRoute(): IAuthorizedApiRoute {return this.Global.selfApiRoute;}
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute {return new AuthorizedRestApi($node.get(), access).mount("/");}
}

export function get(req: express.Request) : IRequestData {return new RequestData(req);}

export type EndwareHandler<T> = rqd.EndwareHandler<IRequestData, T>;
export type ResourceMiddlewareHandler<T> = rqd.ResourceMiddlewareHandler<IRequestData, T>;
export type PermissionMiddlewareHandler = rqd.PermissionMiddlewareHandler<IRequestData>;

export function Endware<T>(handler: EndwareHandler<T>) : express.RequestHandler {
    return rqd.EndwareTemplete<AppGlobal, IRequestData, T>((req: express.Request) => new RequestData(req), handler);
}

export function ResourceMiddleware<T>(handler: ResourceMiddlewareHandler<T>, storageKey?: string) : express.RequestHandler {
    return rqd.ResourceMiddlewareTemplete<AppGlobal, IRequestData, T>((req: express.Request) => new RequestData(req), handler, storageKey);
}

export function PermissionMiddleware(handler: PermissionMiddlewareHandler) : express.RequestHandler {
    return rqd.PermissionMiddlewareTemplete<AppGlobal, IRequestData>((req: express.Request) => new RequestData(req), handler);
}
