import { OnElementCreated } from "./OnElementCreated";
import { ChallengeWindowSize } from "./ChallengeWindowSize";
import {OnElementReady} from "./OnElementReady";


export interface IChallengeOptions {
    container: HTMLElement;
    challengeWindowSize: ChallengeWindowSize;
    onIFrameCreatedFn: OnElementCreated;
    onIFrameReadyFn: OnElementReady;
}


