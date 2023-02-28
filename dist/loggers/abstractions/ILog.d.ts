import { LogLevel } from "./LogLevel";
export interface ILog {
    method: string;
    correlationId: string;
    level: LogLevel;
    message: string;
    content?: object;
    error?: object;
}
