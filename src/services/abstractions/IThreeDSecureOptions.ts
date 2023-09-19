import { IHttpClientOptions } from "../../httpClients/abstractions";
import { IRestLoggerOptions } from "../../loggers/abstractions";
import { IChallengeOptions } from "./IChallengeOptions";
import { OnElementCreated } from "./OnElementCreated";

export interface IThreeDSecureOptions extends IHttpClientOptions, IChallengeOptions, IRestLoggerOptions {
    threeDSecureUrl: string;
    culture: string;
    onContainerCreatedFn: OnElementCreated;
}