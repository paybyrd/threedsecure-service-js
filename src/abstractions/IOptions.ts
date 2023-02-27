type OnProgress = (event: IEvent) => void;
type OnElementCreated = (element: HTMLElement) => void;
enum ChallengeWindowSize {
    width250xheight400 = '01',
    width390xheight400 = '02',
    width500xheight600 = '03',
    width600xheight400 = '04',
    fullscreen = '05'
}

interface IOptions {
    threeDSecureUrl: string;
    container: HTMLElement;
    maxAttempts: number;
    attemptDelay: number;
    culture: string;
    onProgressFn: OnProgress;
    onIFrameCreatedFn: OnElementCreated;
    onContainerCreatedFn: OnElementCreated;
    timeoutInSeconds: number;
    challengeWindowSize: ChallengeWindowSize
}