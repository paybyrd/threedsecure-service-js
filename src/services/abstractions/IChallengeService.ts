import { IChallengeExecute } from "./IChallengeExecute";

export interface IChallengeService {
    execute(request: IChallengeExecute): Promise<void>;
}