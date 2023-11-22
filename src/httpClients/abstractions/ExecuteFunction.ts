import { IRetryIteration } from "./IRetryIteration";


export type ExecuteFunction<T> = (retryIteration: IRetryIteration) => Promise<T>;
