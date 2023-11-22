import { IHttpClientOptions } from "../../httpClients/abstractions";
export interface IRestLoggerOptions extends IHttpClientOptions {
    restLoggerUrl: string;
    batchLogIntervalInSeconds: number;
}
