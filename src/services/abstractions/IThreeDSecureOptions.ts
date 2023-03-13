import { IHttpClientOptions } from "../../httpClients/abstractions";
import { IElasticLoggerOptions } from "../../loggers/abstractions";
import { IChallengeOptions } from "./IChallengeOptions";
import { OnElementCreated } from "./OnElementCreated";

export interface IThreeDSecureOptions extends IHttpClientOptions, IChallengeOptions, IElasticLoggerOptions {
    threeDSecureUrl: string;
    culture: string;
    apiKey: string;
    onContainerCreatedFn: OnElementCreated;
}