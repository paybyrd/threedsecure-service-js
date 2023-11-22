import { ILogger } from "../loggers/abstractions";
import { IHttpClient, IHttpClientOptions, IRequest, IRetryPolicy } from "./abstractions";
import { IResult } from "./abstractions/IResult";
export declare class FetchHttpClient implements IHttpClient {
    private readonly _options;
    private readonly _retryPolicy;
    private readonly _logger;
    constructor(options: IHttpClientOptions, logger: ILogger, retryPolicy?: IRetryPolicy);
    send<T>(request: IRequest): Promise<IResult<T>>;
    isTransientError(response: Response): boolean;
}
