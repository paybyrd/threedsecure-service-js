import { IHttpClientOptions } from "../../httpClients/abstractions";

export interface IElasticLoggerOptions extends IHttpClientOptions {
    elasticLoggerUrl: string;
    batchLogIntervalInSeconds: number;
}