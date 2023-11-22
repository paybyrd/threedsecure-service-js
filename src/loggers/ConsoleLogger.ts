import { ILog, ILogger } from "./abstractions";

export class ConsoleLogger implements ILogger {
    flush(): Promise<void> {
        return Promise.resolve();
    }
    
    log(log: ILog): void {
        const errorLog = {
            ...log,
            error: log.error?.toString()
        };
        console.log(errorLog);
    }

}