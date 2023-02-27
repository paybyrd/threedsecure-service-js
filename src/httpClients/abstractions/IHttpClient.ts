import { IRequest } from "./IRequest";

export interface IHttpClient {
    send<T>(request: IRequest): Promise<T>;
}