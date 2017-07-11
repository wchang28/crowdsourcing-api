
import {HTTPMethod} from "rcf";
import {RequestHandler} from "express";

export type MethodType = HTTPMethod | "USE";
export {RequestHandler} from "express";

export interface ExtensionModuleExportItem {
    pathname: string;
    method: MethodType;
    requestHandlers: RequestHandler | RequestHandler[];
}

export type ExtensionModuleExport = ExtensionModuleExportItem[];