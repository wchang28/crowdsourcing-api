import {IRequestData} from "../../";
import * as express from "express";
import {IAuthorizedApiRoute} from "rcf";
import {IGlobal} from "./global";

export class RequestData implements IRequestData {
    constructor(public req: express.Request) {
        if (!this.req["__request_info__"] ) this.req["__request_info__"] = {};
    }
    private get RequestInfo(): any {return this.req["__request_info__"];}
    private get Global(): IGlobal {return this.req.app.get("global");}
    get Query() : any {return this.req.query;}
    get Params(): any {return this.req.params;}
    get Body(): any {return this.req.body;}

    get SelfApiRoute(): IAuthorizedApiRoute {return this.Global.selfApiRoute;}
}

export function get(req: express.Request) : IRequestData {return new RequestData(req);}