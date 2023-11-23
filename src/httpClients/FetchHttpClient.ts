import { ILogger, LogLevel } from "@paybyrd/logger-js";
import { Stopwatch } from "../shared/utils/Stopwatch";
import { IHttpClient, IHttpClientOptions, IRequest, IRetryPolicy } from "./abstractions";
import { IResult } from "./abstractions/IResult";
import { LinearRetryPolicy } from "./retryPolicies";

export class FetchHttpClient implements IHttpClient {
    private readonly _options: IHttpClientOptions;
    private readonly _retryPolicy: IRetryPolicy;
    private readonly _logger: ILogger;

    constructor(options: IHttpClientOptions, logger: ILogger, retryPolicy: IRetryPolicy = new LinearRetryPolicy(options, logger)) {
        this._retryPolicy = retryPolicy;
        this._logger = logger;
        this._options = options;
    }

    async send<T>(request: IRequest): Promise<IResult<T>> {
        const self = this;
        return await this._retryPolicy.execute<T>({
            executeFn: async ({ attempt, maxAttempts }) => {
                const timeout = (self._options.timeoutInSeconds || 30) * 1000;
                const abortController = new AbortController();
                const timeoutId = setTimeout(() => abortController.abort(), timeout);
                const url = new URL(request.url);
                
                this._logger.log({
                    message: `ExternalService - Request (${url.host})`,
                    content: {
                        request,
                        attempt,
                        maxAttempts
                    },
                    method: "send",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                const stopwatch = new Stopwatch();
                let response : Response;
                try
                {
                    response = await fetch(request.url, {
                        headers: {
                            ...request.headers,
                            'x-attempt': attempt.toString(),
                            'x-max-attempt': maxAttempts.toString(),
                            'accept': 'application/json',
                            'content-type': 'application/json',
                            'correlationId': request.correlationId
                        },
                        keepalive: true,
                        body: JSON.stringify(request.body),
                        method: request.method,
                        signal: abortController.signal
                    });

                    this._logger.log({
                        message: `ExternalService - Response (${url.host}) in ${stopwatch.elapsed}ms`,
                        content: {
                            request,
                            attempt,
                            maxAttempts,
                            response: {
                                statusCode: response.status,
                                data: await response.clone().text()
                            }
                        },
                        method: "send",
                        correlationId: request.correlationId,
                        level: LogLevel.Error
                    });
                }
                catch (error) {
                    this._logger.log({
                        message: `ExternalService - Error (${url.host}) in ${stopwatch.elapsed}ms`,
                        content: {
                            request,
                            attempt,
                            maxAttempts,
                            error
                        },
                        method: "send",
                        correlationId: request.correlationId,
                        level: LogLevel.Error
                    });
                    throw error;
                }

                clearTimeout(timeoutId);
                const result : IResult<T> = {
                    isSuccess: response.ok,
                    isTransientError: this.isTransientError(response),
                    getData: async () => {
                        const result = await response.json();
                        return result.data as T;
                    }
                };
                return result;
            },
            method: `[${request.method}] ${request.url}`,
            correlationId: request.correlationId
        });
    }

    isTransientError(response: Response): boolean {
        const TRANSIENT_STATUS = [409, 424, 500, 503, 504];

        return TRANSIENT_STATUS.includes(response.status);
    }
}