import { IPreAuthResponse } from "./IPreAuthResponse";

export interface IDirectoryServerService {
    execute(preAuthResponse: IPreAuthResponse) : Promise<void>;
}