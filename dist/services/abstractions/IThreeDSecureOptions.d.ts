import { IHttpClientOptions } from "../../httpClients/abstractions";
import { IChallengeOptions } from "./IChallengeOptions";
import { OnElementCreated } from "./OnElementCreated";
import { OnProgress } from "./OnProgress";
export interface IThreeDSecureOptions extends IHttpClientOptions, IChallengeOptions {
    threeDSecureUrl: string;
    culture: string;
    onProgressFn: OnProgress;
    onContainerCreatedFn: OnElementCreated;
}
