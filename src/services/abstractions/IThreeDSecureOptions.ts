import { IHttpClientOptions } from "../../httpClients/abstractions";
import { IChallengeOptions } from "./IChallengeOptions";
import { OnElementCreated } from "./OnElementCreated";

export interface IThreeDSecureOptions extends IHttpClientOptions, IChallengeOptions {
    environment: 'Development' | 'Staging' | 'Production';
    logUrl: string;
    batchLogIntervalInSeconds: number;
    threeDSecureUrl: string;
    culture: string;
    onContainerCreatedFn: OnElementCreated;
}