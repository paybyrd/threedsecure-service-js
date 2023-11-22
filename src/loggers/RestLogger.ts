import { FetchHttpClient } from "../httpClients";
import { IHttpClient } from "../httpClients/abstractions";
import { LinearRetryPolicy } from "../httpClients/retryPolicies";
import { IRestLoggerOptions, ILog, ILogger, LogLevel } from "./abstractions";
import { ConsoleLogger } from "./ConsoleLogger";

interface IFullLog {
    service: {
        name: string;
        version: string
    },
    environment: 'Development' | 'Staging' | 'Production';
    executionDate: Date,
    entrypoint: string;
    method: string;
    correlationId: string;
    level: LogLevel;
    customMessage: string;
    message: string;
    content?: object;
    exeption?: object;
}

export class RestLogger implements ILogger {
    private static readonly DEFAULT_BATCH_TIMEOUT = 5;
    private readonly _httpClient: IHttpClient;
    private readonly _logger: ILogger;
    private readonly _options: IRestLoggerOptions;
    private _logs: Array<IFullLog> = [];
    private _interval: any;

    constructor(options: IRestLoggerOptions,
        logger: ILogger = new ConsoleLogger(),
        httpClient: IHttpClient = new FetchHttpClient(options, logger, new LinearRetryPolicy({
            maxAttempts: 3,
            attemptDelay: 5000
        }, logger))) {
        this._logger = logger;
        this._options = options;
        this._httpClient = httpClient;
        this._interval = setInterval(this.sendBatch.bind(this), (this._options.batchLogIntervalInSeconds || RestLogger.DEFAULT_BATCH_TIMEOUT) * 1000);
    }

    log(log: ILog): void {
        this._logger.log(log);

        if (!this._options.restLoggerUrl)
        {
            return;
        }

        this._logs.unshift({
            customMessage: log.message,
            message: `[Paybyrd.ThreeDSecure.JS] ${log.message}`,
            service: {
                name: 'Paybyrd.ThreeDSecure.JS',
                version: '3.0.0'
            },
            environment: this._options.environment || 'Development',
            executionDate: new Date(),
            entrypoint: 'Execute',
            method: log.method,
            correlationId: log.correlationId,
            content: {
                ...log.content,
                error: log.error?.toString()
            },
            level: log.level
        });
    }

    async flush(): Promise<void> {
        clearInterval(this._interval);
        while (this._logs.length) {
            await this.sendBatch();
        }
        this._interval = setInterval(this.sendBatch.bind(this), (this._options.batchLogIntervalInSeconds || RestLogger.DEFAULT_BATCH_TIMEOUT) * 1000);
    }

    async sendBatch() : Promise<void> {
        const logs = this._logs.splice(0, 10);
        if (!logs.length) {
            return;
        }
        const correlationId = logs.map(x => x.correlationId)[0];
        try {
            await this._httpClient.send<void>({
                url: this._options.restLoggerUrl,
                method: 'POST',
                body: logs,
                correlationId
            });
        } catch (error) {
            this._logger.log({
                error: error,
                message: 'Error sending message to elastic',
                method: 'sendBatch',
                correlationId,
                level: LogLevel.Error
            });
        }
    }
}