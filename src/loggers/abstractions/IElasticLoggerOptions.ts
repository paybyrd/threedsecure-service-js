import { IHttpClientOptions } from "../../httpClients/abstractions";

export interface IElasticLoggerOptions extends IHttpClientOptions {
    elasticLoggerUrl: string;
    apiKey: string;
    batchLogIntervalInSeconds: number;
}