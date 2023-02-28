import { IHttpClient } from "../httpClients/abstractions";
import { IElasticLoggerOptions, ILog, ILogger } from "./abstractions";
export declare class ElasticLogger implements ILogger {
    private readonly _httpClient;
    private readonly _logger;
    private readonly _options;
    private _logs;
    constructor(options: IElasticLoggerOptions, logger?: ILogger, httpClient?: IHttpClient);
    log(log: ILog): void;
    sendBatch(): Promise<void>;
}
