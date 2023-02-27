class IFrameDirectoryServer implements IDirectoryServer {
    private static readonly IFRAME_NAME: string = 'threeDSMethodIframe';
    private static readonly FORM_NAME: string = 'threeDSMethodForm';
    private static readonly FORM_INPUT_NAME: string = 'threeDSMethodData';
    private static readonly FROM_INPUT_TYPE: string = 'hidden';

    private readonly _logger: Logger;
    private readonly _options: IOptions;

    constructor(options: IOptions, logger: ILogger) {
        this._logger = logger;
        this._options = options;
    }

    execute(preAuthResponse: IPreAuthResponse) : Promise<void> {
        if (!preAuthResponse.dsMethodUrl) {
            return Promise.resolve();
        }        

        return new Promise<void>((resolve, reject) => {
            try {
                const iframe = HTMLElementFactory.createIFrame({
                    parent: this._options.container,
                    isVisible: false,
                    name: IFrameDirectoryServer.IFRAME_NAME,
                    useDefaultStyle: !!this._options.onIFrameCreatedFn
                });
                this._options.onIFrameCreatedFn?.call(this._options, iframe);
                
                const form = HTMLElementFactory.createForm({
                    parent: this._options.container,
                    name: IFrameDirectoryServer.FORM_NAME,
                    actionUrl: preAuthResponse.dsMethodUrl,
                    target: IFrameDirectoryServer.IFRAME_NAME,
                    method: 'POST'
                });

                const threeDSMethodDataInput = HTMLElementFactory.createInput({
                    parent: form,
                    name: IFrameDirectoryServer.FORM_INPUT_NAME,
                    type: IFrameDirectoryServer.FROM_INPUT_TYPE
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