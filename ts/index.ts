
import {HTTPMethod} from "rcf";
import {RequestHandler} from "express";

export interface ExtensionModuleExportItem {
    pathname: string;
    method: HTTPMethod | "USE";
    requestHandlers: RequestHandler[];
}

export type ExtensionModuleExport = ExtensionModuleExportItem[];