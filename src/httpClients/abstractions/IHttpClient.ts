import { IRequest } from "./IRequest";
import { IResult } from "./IResult";

export interface IHttpClient {
    send<T>(request: IRequest): Promise<IResult<T>>;
}