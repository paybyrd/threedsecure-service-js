import { IChallengeOptions } from "./IChallengeOptions";
import { OnElementCreated } from "./OnElementCreated";

export interface IThreeDSecureOptions extends IChallengeOptions {
    environment: 'Development' | 'Staging' | 'Production';
    logUrl: string;
    batchLogIntervalInSeconds: number;
    threeDSecureUrl: string;
    culture: string;
    onContainerCreatedFn: OnElementCreated;
    timeoutInSeconds: number;
    attemptDelayInSeconds: number,
    maxAttempts: number
}