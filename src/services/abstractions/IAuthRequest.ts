import { IExecuteRequest } from "./IExecuteRequest";

export interface IAuthRequest extends IExecuteRequest {
    correlationId: string;
    id: string;
}
