import {IRequestData} from "./";
import * as express from "express";
import {IAuthorizedApiRoute, AuthorizedRestApi, OAuth2Access} from "rcf";
import {AppGlobal} from "./app-global";
import * as $node from "rest-node";

export class RequestData implements IRequestData {
    constructor(public req: express.Request) {
        if (!this.req["__request_info__"]) this.req["__request_info__"] = {};
    }
    private get RequestInfo(): any {return this.req["__request_info__"];}
    private get Global(): AppGlobal {return this.req.app.get("global");}
    get Query() : any {return this.req.query;}
    get Params(): any {return this.req.params;}
    get Body(): any {return this.req.body;}
    get(field: string) : any {return (this.RequestInfo)[field];}
    set(field: string, value: any) : void {(this.RequestInfo)[field] = value;}

    get SelfApiRoute(): IAuthorizedApiRoute {return this.Global.selfApiRoute;}
    getRestApiRoute(access: OAuth2Access): IAuthorizedApiRoute {return new AuthorizedRestApi($node.get(), access).mount("/");}
}