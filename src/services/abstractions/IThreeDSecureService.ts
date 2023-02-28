import { IExecuteRequest } from "./IExecuteRequest";
import { IPostAuthResponse } from "./IPostAuthResponse";

export interface IThreeDSecureService {
    execute(request: IExecuteRequest): Promise<IPostAuthResponse>;
}