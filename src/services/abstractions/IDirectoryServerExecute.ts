import { IPreAuthResponse } from "./IPreAuthResponse";

export interface IDirectoryServerExecute {
    preAuthResponse: IPreAuthResponse,
    correlationId: string;
}
