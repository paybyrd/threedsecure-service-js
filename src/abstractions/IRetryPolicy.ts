interface IResult<T> {
    isSuccess: boolean;
    isTransientError: boolean;
    data: T;
}

interface IRetryIteration {
    attempt: number;
    maxAttempts: number;
}

type ExecuteFunction<T> = (retryIteration: IRetryIteration) => Promise<IResult<T>>;

interface IRetryPolicy {
    execute<T>(executeFn: ExecuteFunction<T>, method: string) : Promise<T>;
}