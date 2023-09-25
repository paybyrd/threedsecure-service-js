import { ILogger } from "../../loggers/abstractions";
import { IRetryExecution, IRetryOptions, IRetryPolicy } from "../abstractions";
export declare class LinearRetryPolicy implements IRetryPolicy {
    private readonly _options;
    private readonly _logger;
    constructor(options: IRetryOptions, logger: ILogger);
    execute<T>({ executeFn, method, correlationId }: IRetryExecution<T>): Promise<T>;
}