import { ICreateForm, ICreateIFrame, ICreateInput } from "./abstractions";
export declare class HtmlElementFactory {
    static createIFrame(createIFrame: ICreateIFrame): HTMLIFrameElement;
    static createForm(createForm: ICreateForm): HTMLFormElement;
    static createInput(createInput: ICreateInput): HTMLInputElement;
}
