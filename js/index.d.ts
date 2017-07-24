/// <reference types="express" />
import * as express from "express";
export { Request, Response, NextFunction, Router, RequestHandler } from "express";
export * from "rcf";
export { AppGlobal, CGIChildProcessLauncher } from "./app-global";
export { ExecOptions } from "child_process";
export interface ExtensionModule {
    module: string;
    homePath: string;
    package_json: any;
    README_md?: string;
}
export interface ExtensionModuleExport {
    init(moduleRouter: express.Router): void;
}
export * from "./request-data";
