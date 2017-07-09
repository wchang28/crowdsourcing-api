import { IWebServerConfig } from 'express-web-server';
export interface IAppConfig {
    adminServerConfig: IWebServerConfig;
    msgServerConfig: IWebServerConfig;
    proxyServerConfig: IWebServerConfig;
}
