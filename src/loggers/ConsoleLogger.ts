import { ILog, ILogger } from "./abstractions";

export class ConsoleLogger implements ILogger {
    log(log: ILog): void {
        console.log(JSON.stringify(log));
    }

}