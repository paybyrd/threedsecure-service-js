import { IHttpClientOptions } from "../../httpClients/abstractions";
import { IChallengeOptions } from "./IChallengeOptions";
import { OnElementCreated } from "./OnElementCreated";
export interface IThreeDSecureOptions extends IHttpClientOptions, IChallengeOptions {
    threeDSecureUrl: string;
    culture: string;
    onContainerCreatedFn: OnElementCreated;
}
