import { ILogger } from "../loggers/abstractions";
import { IHttpClient, IHttpClientOptions, IRequest, IRetryPolicy } from "./abstractions";
import { LinearRetryPolicy } from "./retryPolicies";

export class FetchHttpClient implements IHttpClient {
    private readonly _options: IHttpClientOptions;
    private readonly _retryPolicy: IRetryPolicy;
    private readonly _logger: ILogger;

    constructor(options: IHttpClientOptions, logger: ILogger, retryPolicy: IRetryPolicy = new LinearRetryPolicy(options, logger)) {
        this._retryPolicy = retryPolicy;
        this._logger = logger;
    }
    
    async send<T>(request: IRequest): Promise<T> {
        return await this._retryPolicy.execute<T>(async ({attempt, maxAttempts}) => {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), this._options.timeoutInSeconds * 1000);

            const response = await fetch(request.url, {
                headers: {
                    ...request.headers,
                    'x-attempt': attempt.toString(),
                    'x-max-attempts': maxAttempts.toString(),
                    'accept': 'application/json',
                    'content-type': 'application/json',
                },
                keepalive: true,
                body: JSON.stringify(request.body),
                method: request.method,
                signal: abortController.signal
            });

            clearTimeout(timeoutId);
            return {
                isSuccess: response.ok,
                isTransientError: this.isTransientError(response),
                data: await response.json()
            };
        }, `[${request.method}] ${request.url}`);
    }

    isTransientError(response: Response): boolean {
        return response.status === 409
        || response.status === 424
        || response.status == 500
        || response.status == 503
        || response.status === 504;
    }
}