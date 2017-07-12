/// <reference types="express" />
import { IRequestData } from "./";
import * as express from "express";
import { IAuthorizedApiRoute, OAuth2Access } from "rcf";
export declare class RequestData implements IRequestData {
    req: express.Request;
    constructor(req: express.Request);
    private readonly RequestInfo;
    private readonly Global;
    readonly Query: any;
    readonly Params: any;
    readonly Body: any;
    get(field: string): any;
    set(field: string, value: any): void;
    readonly SelfApiRoute: IAuthorizedApiRoute;
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute;
}
