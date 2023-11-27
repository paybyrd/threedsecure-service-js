export enum EventName {

    PreAuthStarted = 'preAuth:started',
    PreAuthCompleted = 'preAuth:completed',
    AuthStarted = 'auth:started',
    AuthCompleted = 'auth:completed',
    PostAuthStarted = 'postAuth:started',
    PostAuthCompleted = 'postAuth:completed',
    PostAuthFailed = 'postAuth:failed',
    ResetStarted = 'reset:started',
    ResetCompleted = 'reset:completed'
}

export interface IEvent {
    name: EventName;
    data?: object | null | undefined;
}