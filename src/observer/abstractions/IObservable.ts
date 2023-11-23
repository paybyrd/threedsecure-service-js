import { IObserver } from "./IObserver";

export interface IObservable {
    subscribe(observer: IObserver): void;
    unsubscribe(observer: IObserver): void;
}