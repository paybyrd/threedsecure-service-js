import { ExecuteFunction } from "./ExecuteFunction";


export interface IRetryExecution<T> {
    executeFn: ExecuteFunction<T>;
    method: string;
    correlationId: string;
}
