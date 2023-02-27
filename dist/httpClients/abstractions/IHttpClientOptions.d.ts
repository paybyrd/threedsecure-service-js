import { IRetryOptions } from "./IRetryOptions";
export interface IHttpClientOptions extends IRetryOptions {
    timeoutInSeconds: number;
}
