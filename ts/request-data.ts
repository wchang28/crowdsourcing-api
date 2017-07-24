import {IRequestData} from "./";
import * as express from "express";
import * as rqd from "request-data";
import {IAuthorizedApiRoute, AuthorizedRestApi, OAuth2Access} from "rcf";
import {AppGlobal, CGIChildProcessLauncher} from "./app-global";
import * as $node from "rest-node";
import {Readable} from "stream";

export interface IRequestData extends rqd.IRequestData<AppGlobal> {
    readonly SelfApiRoute: IAuthorizedApiRoute;
    readonly CGIChildProcessLauncher: CGIChildProcessLauncher;
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute;
}

class RequestData extends rqd.RequestData<AppGlobal> implements IRequestData {
    constructor(req: express.Request) {super(req);}
    get SelfApiRoute(): IAuthorizedApiRoute {return this.Global.selfApiRoute;}
    get CGIChildProcessLauncher(): CGIChildProcessLauncher {return this.Global.cgiChildProcessLauncher;}
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute {return new AuthorizedRestApi($node.get(), access).mount("/");}
}

export function getRequestData(req: express.Request) : IRequestData {return new RequestData(req);}

export type JSONEndwareHandler<T> = rqd.JSONEndwareHandler<IRequestData, T>;
export type ReadableStreamEndwareHandler = rqd.ReadabeStreamEndwareHandler<IRequestData>;
export type ResourceMiddlewareHandler<T> = rqd.ResourceMiddlewareHandler<IRequestData, T>;
export type PermissionMiddlewareHandler = rqd.PermissionMiddlewareHandler<IRequestData>;
export type CGIEndwareHandler = (rqd: IRequestData) => Promise<Readable>;   // returns child process's stdout

let factory = (req: express.Request) => new RequestData(req);

export function JSONEndware<T>(handler: JSONEndwareHandler<T>) : express.RequestHandler {
    return rqd.JSONEndwareTemplete<AppGlobal, IRequestData, T>(factory, handler);
}

export function ReadableStreamEndware(handler: ReadableStreamEndwareHandler) : express.RequestHandler {
    return rqd.ReadableStreamEndwareTemplete<AppGlobal, IRequestData>(factory, handler);
}

export function CGIEndware(contentType: string, handler: CGIEndwareHandler) : express.RequestHandler {
    let h = (rqd: IRequestData) => {
        return handler(rqd).then((stdout: Readable) => {
            let content: rqd.ReadableStreamContent = {
                 info: {
                     type: contentType
                }
                ,readable: stdout
            };
            return content;
        });
    };
    return ReadableStreamEndware(h);
}

export function ResourceMiddleware<T>(handler: ResourceMiddlewareHandler<T>, storageKey?: string) : express.RequestHandler {
    return rqd.ResourceMiddlewareTemplete<AppGlobal, IRequestData, T>(factory, handler, storageKey);
}

export function PermissionMiddleware(handler: PermissionMiddlewareHandler) : express.RequestHandler {
    return rqd.PermissionMiddlewareTemplete<AppGlobal, IRequestData>(factory, handler);
}
