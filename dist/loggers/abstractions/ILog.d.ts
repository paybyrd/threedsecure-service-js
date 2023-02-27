import { IError } from "../../shared/abstractions/IError";
export interface ILog extends IError {
    content?: object;
}
