interface IExecuteRequest {
    id: string;
    correlationId: string;
}

interface IExecuteResponse {
    id: string;
}

interface IPreAuthRequest {
    id: string;
}

interface IPreAuthResponse {
    id: string;
    notificationUrl: string;
    processId: string;
    dsMethodUrl: string;
}

interface IAuthRequest {
    id: string;
}

interface IAuthResponse {
    challengeVersion: any;
    challengeId: any;
    processId: any;
    challengeUrl: string;
    id: string;
}

interface IPostAuthRequest {
    id: string;
}

interface IPostAuthResponse {
    id: string;
}

interface IThreeDSecure {
    execute(request: IExecuteRequest): Promise<IExecuteResponse>;
}
