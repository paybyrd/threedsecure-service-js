import { IDirectoryServerExecute } from "./IDirectoryServerExecute";

export interface IDirectoryServerService {
    execute(request: IDirectoryServerExecute) : Promise<void>;
}