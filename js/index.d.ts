/// <reference types="express" />
import * as express from "express";
import { IAuthorizedApiRoute } from "rcf";
export { Request, Response, NextFunction, Router, RequestHandler } from "express";
export * from "rcf";
export { AppGlobal } from "./app-global";
export interface ExtensionModuleExport {
    init(moduleRouter: express.Router): void;
}
export interface IRequestData {
    readonly req: express.Request;
    readonly Query: any;
    readonly Params: any;
    readonly Body: any;
    get(field: string): any;
    set(field: string, value: any): void;
    readonly SelfApiRoute: IAuthorizedApiRoute;
}
export declare function getRequestData(req: express.Request): IRequestData;
