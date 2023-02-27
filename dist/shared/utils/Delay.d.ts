import { IDelay } from "../abstractions";
export declare class Delay implements IDelay {
    private _task;
    private _timeout;
    constructor(delay: number);
    wait(): Promise<void>;
    cancel(): void;
    static sleep(delay: number): IDelay;
    static cancel(id: number): void;
}
