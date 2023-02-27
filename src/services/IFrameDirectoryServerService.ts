import { ILogger } from "../loggers/abstractions";
import { Base64Converter, HtmlElementFactory } from "../shared/utils";
import { IDirectoryServerOptions, IDirectoryServerService } from "./abstractions";
import { IPreAuthResponse } from "./abstractions/IPreAuthResponse";

export class IFrameDirectoryServerService implements IDirectoryServerService {
    private static readonly IFRAME_NAME: string = 'threeDSMethodIframe';
    private static readonly FORM_NAME: string = 'threeDSMethodForm';
    private static readonly FORM_INPUT_NAME: string = 'threeDSMethodData';
    private static readonly FROM_INPUT_TYPE: string = 'hidden';

    private readonly _logger: ILogger;
    private readonly _options: IDirectoryServerOptions;

    constructor(options: IDirectoryServerOptions, logger: ILogger) {
        this._logger = logger;
        this._options = options;
    }

    execute(preAuthResponse: IPreAuthResponse) : Promise<void> {
        if (!preAuthResponse.dsMethodUrl) {
            return Promise.resolve();
        }        

        return new Promise<void>((resolve, reject) => {
            try {
                const iframe = HtmlElementFactory.createIFrame({
                    parent: this._options.container,
                    isVisible: false,
                    name: IFrameDirectoryServerService.IFRAME_NAME,
                    useDefaultStyle: !!this._options.onIFrameCreatedFn
                });
                this._options.onIFrameCreatedFn?.call(this._options, iframe);
                
                const form = HtmlElementFactory.createForm({
                    parent: this._options.container,
                    name: IFrameDirectoryServerService.FORM_NAME,
                    actionUrl: preAuthResponse.dsMethodUrl,
                    target: IFrameDirectoryServerService.IFRAME_NAME,
                    method: 'POST'
                });

                const threeDSMethodDataInput = HtmlElementFactory.createInput({
                    parent: form,
                    name: IFrameDirectoryServerService.FORM_INPUT_NAME,
                    type: IFrameDirectoryServerService.FROM_INPUT_TYPE
                });

                const threeDSMethodData = {
                    threeDSServerTransID: preAuthResponse.processId,
                    threeDSMethodNotificationURL: preAuthResponse.notificationUrl
                };

                threeDSMethodDataInput.value = Base64Converter.convert(threeDSMethodData);

                form.submit();

                resolve();
            }
            catch (error) {
                return reject({
                    message: error.toString()
                });
            }
        });
    }
}