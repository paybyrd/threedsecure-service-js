import { IAuthResponse } from "./IAuthResponse";
export interface IChallengeService {
    execute(authResponse: IAuthResponse): Promise<void>;
}
