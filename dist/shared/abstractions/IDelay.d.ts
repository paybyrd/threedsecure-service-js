export interface IDelay {
    wait(): Promise<void>;
    cancel(): void;
}
