/// <reference types="express" />
import * as express from "express";
export { Request, Response, NextFunction, Router, RequestHandler } from "express";
export * from "rcf";
export { AppGlobal } from "./app-global";
export interface ExtensionModuleExport {
    init(moduleRouter: express.Router): void;
}
export * from "./request-data";
