/// <reference types="express" />
import * as express from 'express';
export interface IAPIAppFactory {
    readonly SelfPort: number;
    create(): express.Express;
    on(event: "app-just-created", listener: (app: express.Express) => void): this;
}
export interface AppFactoryOptions {
    SelfPort: number;
}
export declare function get(options: AppFactoryOptions): IAPIAppFactory;
