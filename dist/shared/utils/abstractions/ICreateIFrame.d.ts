import { OnElementCreated } from "../../../services/abstractions/OnElementCreated";
import { OnElementReady } from "../../../services/abstractions/OnElementReady";
export interface ICreateIFrame {
    parent: HTMLElement;
    name: string;
    isVisible: boolean;
    useDefaultStyle: boolean;
    onReadyFn?: OnElementReady;
    onCreatedFn?: OnElementCreated;
}
