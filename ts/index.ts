import * as express from "express";
import {IAuthorizedApiRoute, OAuth2Access} from "rcf";
import {AppGlobal} from "./app-global";

export {Request, Response, NextFunction, Router, RequestHandler} from "express";
export * from "rcf";
export {AppGlobal} from "./app-global";

export interface ExtensionModuleExport {
    init(moduleRouter: express.Router): void;
}

export * from "./request-data";