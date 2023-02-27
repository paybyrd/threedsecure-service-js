class IFrameChallenge implements IChallenge {
    private static readonly IFRAME_NAME = 'challengeIframe';
    private static readonly FORM_NAME = 'challengeForm';
    private static readonly CREQ_INPUT_NAME = 'creq';
    private static readonly CREQ_INPUT_TYPE = 'hidden';

    private readonly _options: IOptions;
    private readonly _logger: ILogger;

    constructor(options: IOptions, logger: ILogger) {
        this._options = options;
        this._logger = logger;
    }

    execute(authResponse: IAuthResponse): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {

                 HTMLElementFactory.createIFrame({
                    parent: this._options.container,
                    name: IFrameChallenge.IFRAME_NAME,
                    isVisible: true,
                    useDefaultStyle: !!this._options.onIFrameCreatedFn
                });
                
                const form = HTMLElementFactory.createForm({
                    parent: this._options.container,
                    name: IFrameChallenge.FORM_NAME,
                    actionUrl: authResponse.challengeUrl,
                    target: IFrameChallenge.IFRAME_NAME,
                    method: 'post'
                });

                const threeDSRequestInput = HTMLElementFactory.createInput({
                    parent: form,
                    name: IFrameChallenge.CREQ_INPUT_NAME,
                    type: IFrameChallenge.CREQ_INPUT_TYPE
                });

                const cReq = {
                    threeDSServerTransID: authResponse.processId,
                    acsTransID: authResponse.challengeId,
                    messageVersion: authResponse.challengeVersion,
                    messageType: "CReq",
                    challengeWindowSize: this._options.challengeWindowSize || ChallengeWindowSize.width250xheight400
                };

                threeDSRequestInput.value = Base64Converter.convert(cReq);

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