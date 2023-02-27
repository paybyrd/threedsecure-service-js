import { IResult } from "./IResult";
import { IRetryIteration } from "./IRetryIteration";
export type ExecuteFunction<T> = (retryIteration: IRetryIteration) => Promise<IResult<T>>;
