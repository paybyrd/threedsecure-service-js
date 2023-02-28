import { IRetryExecution } from "./IRetryExecution";
export interface IRetryPolicy {
    execute<T>(request: IRetryExecution<T>): Promise<T>;
}
