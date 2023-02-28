import { ILog, ILogger } from "./abstractions";

export class ConsoleLogger implements ILogger {
    flush(): Promise<void> {
        return Promise.resolve();
    }
    
    log(log: ILog): void {
        console.log(JSON.stringify(log));
    }

}