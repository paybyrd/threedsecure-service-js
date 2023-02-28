import { IHttpClient } from "../httpClients/abstractions";
import { IElasticLoggerOptions, ILog, ILogger } from "./abstractions";
export declare class ElasticLogger implements ILogger {
    private static readonly DEFAULT_BATCH_TIMEOUT;
    private readonly _httpClient;
    private readonly _logger;
    private readonly _options;
    private _logs;
    private _interval;
    constructor(options: IElasticLoggerOptions, logger?: ILogger, httpClient?: IHttpClient);
    log(log: ILog): void;
    flush(): Promise<void>;
    sendBatch(): Promise<void>;
}
