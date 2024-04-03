import { IExecuteRequest } from "./IExecuteRequest";

export interface IPostAuthRequest extends IExecuteRequest {
    correlationId: string;
    id: string;
}
