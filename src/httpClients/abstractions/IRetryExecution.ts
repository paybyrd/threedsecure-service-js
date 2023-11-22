import { ExecuteFunction } from "./ExecuteFunction";
import { IResult } from "./IResult";

export interface IRetryExecution<T> {
    executeFn: ExecuteFunction<IResult<T>>;
    method: string;
    correlationId: string;
}
