import { ILog } from "./ILog";
export interface ILogger {
    log(log: ILog): void;
    flush(): Promise<void>;
}
