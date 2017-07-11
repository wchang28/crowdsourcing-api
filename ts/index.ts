
import * as express from "express";

export interface ExtensionModuleExport {
    init(moduleRouter: express.Router): void;
}