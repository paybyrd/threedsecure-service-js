import { IAuthResponse } from "./IAuthResponse";

export interface IChallengeExecute {
    authResponse: IAuthResponse,
    correlationId: string;
}
