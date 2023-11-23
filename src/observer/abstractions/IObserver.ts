import { IEvent } from "./IEvent";

export interface IObserver {
    notify(event: IEvent): void;
}