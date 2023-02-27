import { ILog, ILogger } from "../../loggers/abstractions";
import { Delay } from "../../shared/utils";
import { ExecuteFunction, IRetryOptions, IRetryPolicy } from "../abstractions";

export class LinearRetryPolicy implements IRetryPolicy {
    private readonly _options: IRetryOptions;
    private readonly _logger: ILogger;

    constructor(options: IRetryOptions, logger: ILogger) {
        this._options = options;
        this._logger = logger;
    }
    
    execute<T>(executeFn: ExecuteFunction<T>, method: string) : Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            let attempt = 1;
            let lastError: ILog|null = null;
            do {
                try {
                    let result = await executeFn({
                        attempt: attempt,
                        maxAttempts: this._options.maxAttempts
                    });
                    if (result.isSuccess) {
                        resolve(result.data);
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
                    this._logger.log(lastError);
                }
                attempt++;
                await Delay.sleep(this._options.attemptDelay).wait();
            } while (attempt <= this._options.maxAttempts);

            reject(lastError);
        });
    }
}