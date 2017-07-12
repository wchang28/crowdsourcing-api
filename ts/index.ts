import * as express from "express";
import {IAuthorizedApiRoute, OAuth2Access} from "rcf";
import {RequestData} from "./request-data";
export {Request, Response, NextFunction, Router, RequestHandler} from "express";
export * from "rcf";
export {AppGlobal} from "./app-global";

export interface ExtensionModuleExport {
    init(moduleRouter: express.Router): void;
}

export interface IRequestData {
    readonly req: express.Request;
    readonly Query: any;
    readonly Params: any;
    readonly Body: any;
    get(field: string) : any;
    set(field: string, value: any) : void;

    readonly SelfApiRoute: IAuthorizedApiRoute;
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute;
}

export function getRequestData(req: express.Request): IRequestData {return new RequestData(req);} 