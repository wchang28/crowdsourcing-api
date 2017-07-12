/// <reference types="express" />
import * as express from 'express';
export interface IAPIAppFactory {
    create(): express.Express;
    on(event: "app-just-created", listener: (app: express.Express) => void): this;
}
export interface AppFactoryOptions {
}
export declare function get(options: AppFactoryOptions): IAPIAppFactory;
