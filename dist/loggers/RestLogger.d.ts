import { IHttpClient } from "../httpClients/abstractions";
import { IRestLoggerOptions, ILog, ILogger } from "./abstractions";
export declare class RestLogger implements ILogger {
    private static readonly DEFAULT_BATCH_TIMEOUT;
    private readonly _httpClient;
    private readonly _logger;
    private readonly _options;
    private _logs;
    private _interval;
    constructor(options: IRestLoggerOptions, logger?: ILogger, httpClient?: IHttpClient);
    log(log: ILog): void;
    flush(): Promise<void>;
    sendBatch(): Promise<void>;
}
