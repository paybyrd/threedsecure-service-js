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

            this._logger.log({
                message: '[Request] HttpClient',
                content: {
                    request,
                    attempt,
                    maxAttempts
                }
            });

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

            this._logger.log({
                message: '[Response] HttpClient',
                content: {
                    response,
                    attempt,
                    maxAttempts
                }
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
        const TRANSIENT_STATUS = [409, 424, 500, 503, 504];

        return TRANSIENT_STATUS.includes(response.status);
    }
}