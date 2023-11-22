export interface IResult<T> {
    isSuccess: boolean;
    isTransientError: boolean;
    getData: () => Promise<T>;
}
