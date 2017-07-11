export interface ExtensionModule {
    module: string;
    package_json: any;
    README_md?: string;
}
export declare function getAllExtensionModules(NODE_PATH: string): ExtensionModule[];
