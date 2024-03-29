import { ICreateForm, ICreateIFrame, ICreateInput } from "./abstractions";

export class HtmlElementFactory {
    static createIFrame(createIFrame: ICreateIFrame) : HTMLIFrameElement {
        const iframe = document.createElement('iframe');
        iframe.id = createIFrame.name;
        iframe.name = createIFrame.name;

        if (createIFrame.onReadyFn) {
            createIFrame.onReadyFn(iframe, createIFrame.isVisible);
        }

        if (createIFrame.onCreatedFn) {
            createIFrame.onCreatedFn(iframe);
            iframe.style.opacity = createIFrame.isVisible ? "1" : "0";
        }

        createIFrame.parent.appendChild(iframe);

        return iframe;
    }

    static createForm(createForm: ICreateForm): HTMLFormElement {
        const form = document.createElement('form');
        form.id = createForm.name;
        form.name = createForm.name;
        form.action = createForm.actionUrl;
        form.target = createForm.target;
        form.method = createForm.method;
        
        createForm.parent.appendChild(form);

        return form;
    }

    static createInput(createInput: ICreateInput): HTMLInputElement {
        const input = document.createElement('input');
        input.id = createInput.name;
        input.name = createInput.name;
        input.type = createInput.type;
        
        createInput.parent.appendChild(input);

        return input;
    }
}