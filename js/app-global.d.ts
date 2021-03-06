/// <reference types="node" />
import { Readable } from "stream";
import { ExecOptions } from "child_process";
export interface CGIChildProcessLauncher {
    exec(command: string, options?: ExecOptions): Promise<Readable>;
}
export interface AppGlobal {
    cgiChildProcessLauncher: CGIChildProcessLauncher;
}
