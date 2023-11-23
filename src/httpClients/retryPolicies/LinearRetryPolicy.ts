import { ILogger, LogLevel } from "@paybyrd/logger-js";
import { IError } from "../../shared/abstractions";
import { Delay } from "../../shared/utils";
import { IRetryExecution, IRetryOptions, IRetryPolicy } from "../abstractions";
import { IResult } from "../abstractions/IResult";

export class LinearRetryPolicy implements IRetryPolicy {
    private readonly _options: IRetryOptions;
    private readonly _logger: ILogger;

    constructor(options: IRetryOptions, logger: ILogger) {
        this._options = options;
        this._logger = logger;
    }
    
    execute<T>({
        executeFn,
        method,
        correlationId
    }: IRetryExecution<T>) : Promise<IResult<T>> {
        return new Promise<IResult<T>>(async (resolve, reject) => {
            let attempt = 1;
            let lastError: IError | null = null;
            do {
                try {
                    let result = await executeFn({
                        attempt: attempt,
                        maxAttempts: this._options.maxAttempts
                    });
                    if (result.isSuccess) {
                        resolve(result);
                        return;
                    }
                    if (!result.isTransientError) {
                        reject(result);
                        return;
                    }
                }
                catch (error) {
                    lastError = {
                        message: `Unhandled error calling "${method}"`,
                        error,
                        additionalData: {
                            attempt,
                            maxAttempts: this._options.maxAttempts
                        }
                    };

                    this._logger.log({
                        message: `Unhandled error calling "${method}"`,
                        error,
                        content: {
                            attempt,
                            maxAttempts: this._options.maxAttempts
                        },
                        method: method,
                        correlationId: correlationId,
                        level: LogLevel.Warning
                    });
                }
                attempt++;
                await Delay.sleep(this._options.attemptDelayInSeconds * 1000).wait();
            } while (attempt <= this._options.maxAttempts);

            reject(lastError);

            this._logger.log({
                message: `Unhandled error calling "${method}"`,
                error: lastError?.error,
                content: {
                    attempt,
                    maxAttempts: this._options.maxAttempts
                },
                method: method,
                correlationId: correlationId,
                level: LogLevel.Error
            });
        });
    }
}