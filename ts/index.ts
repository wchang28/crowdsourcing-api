import * as express from "express";
import {IAuthorizedApiRoute} from "rcf";
import {get as getReq} from "./server/api/request-data";
export {Request, Response, NextFunction, Router, RequestHandler} from "express";
export * from "rcf";

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
}

export function getRequestData(req: express.Request): IRequestData {return getReq(req);} 