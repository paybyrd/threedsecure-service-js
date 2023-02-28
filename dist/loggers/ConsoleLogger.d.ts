import { ILog, ILogger } from "./abstractions";
export declare class ConsoleLogger implements ILogger {
    flush(): Promise<void>;
    log(log: ILog): void;
}
