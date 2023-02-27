
export interface IResult<T> {
    isSuccess: boolean;
    isTransientError: boolean;
    data: T;
}
