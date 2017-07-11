/// <reference types="express" />
import * as express from "express";
export interface ExtensionModuleExport {
    init(router: express.Router): void;
}
