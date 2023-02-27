import { IDelay } from "../abstractions";

export class Delay implements IDelay {
    private _task: Promise<void>;
    private _timeout: NodeJS.Timeout;
    
    constructor(delay: number) {
        this._task = new Promise<void>((resolve) => {
            this._timeout = setTimeout(resolve, delay);
        });
    }

    wait() {
        return this._task;
    }

    cancel() {
        clearTimeout(this._timeout);
        this._task = Promise.reject({
            message: 'Timer cancelled'
        });
    }

    static sleep(delay: number): IDelay {
        return new Delay(delay);
    }

    static cancel(id: number) {
        clearTimeout(id);
    }
}