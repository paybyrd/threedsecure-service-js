import { ExecuteFunction } from "./ExecuteFunction";

export interface IRetryPolicy {
    execute<T>(executeFn: ExecuteFunction<T>, method: string) : Promise<T>;
}