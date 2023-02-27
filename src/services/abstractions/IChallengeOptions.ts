import { OnElementCreated } from "./OnElementCreated";
import { ChallengeWindowSize } from "./ChallengeWindowSize";


export interface IChallengeOptions {
    container: HTMLElement;
    challengeWindowSize: ChallengeWindowSize;
    onIFrameCreatedFn: OnElementCreated;
}


