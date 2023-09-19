export interface ICreateIFrame {
    parent: HTMLElement;
    name: string;
    isVisible: boolean;
    useDefaultStyle: boolean;
    onReadyFn?: (isVisible: boolean) => void;
    onIFrameCreatedFn?: (iframe: HTMLIFrameElement) => void;
}
