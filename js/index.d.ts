/// <reference types="express" />
import { HTTPMethod } from "rcf";
import { RequestHandler } from "express";
export declare type MethodType = HTTPMethod | "USE";
export { RequestHandler } from "express";
export interface ExtensionModuleExportItem {
    pathname: string;
    method: MethodType;
    requestHandlers: RequestHandler | RequestHandler[];
}
export declare type ExtensionModuleExport = ExtensionModuleExportItem[];
