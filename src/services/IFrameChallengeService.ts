import { ILogger, LogLevel } from "../loggers/abstractions";
import { Base64Converter, HtmlElementFactory } from "../shared/utils";
import { ChallengeWindowSize, IChallengeExecute, IChallengeOptions, IChallengeService } from "./abstractions";

export class IFrameChallengeService implements IChallengeService {
    private static readonly IFRAME_NAME = 'challengeIframe';
    private static readonly FORM_NAME = 'challengeForm';
    private static readonly CREQ_INPUT_NAME = 'creq';
    private static readonly CREQ_INPUT_TYPE = 'hidden';

    private readonly _options: IChallengeOptions;
    private readonly _logger: ILogger;

    constructor(options: IChallengeOptions, logger: ILogger) {
        this._options = options;
        this._logger = logger;
    }

    execute(request: IChallengeExecute): Promise<void> {
        if (!request.authResponse.challengeUrl) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            try {
                this._logger.log({
                    message: '[Request] Challenge execution',
                    content: {
                        authResponse: request.authResponse
                    },
                    method: "executeChallenge",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                this._options.container.innerHTML = '';

                HtmlElementFactory.createIFrame({
                    parent: this._options.container,
                    name: IFrameChallengeService.IFRAME_NAME,
                    isVisible: true,
                    useDefaultStyle: !!this._options.onIFrameCreatedFn,
                    onCreatedFn: this._options.onIFrameCreatedFn,
                    onReadyFn: this._options.onIFrameReadyFn
                });
                
                const form = HtmlElementFactory.createForm({
                    parent: this._options.container,
                    name: IFrameChallengeService.FORM_NAME,
                    actionUrl: request.authResponse.challengeUrl,
                    target: IFrameChallengeService.IFRAME_NAME,
                    method: 'post'
                });

                const threeDSRequestInput = HtmlElementFactory.createInput({
                    parent: form,
                    name: IFrameChallengeService.CREQ_INPUT_NAME,
                    type: IFrameChallengeService.CREQ_INPUT_TYPE
                });

                const cReq = {
                    threeDSServerTransID: request.authResponse.processId,
                    acsTransID: request.authResponse.challengeId,
                    messageVersion: request.authResponse.challengeVersion,
                    messageType: "CReq",
                    challengeWindowSize: this._options.challengeWindowSize || ChallengeWindowSize.width250xheight400
                };

                const base64CReq = Base64Converter.convert(cReq)
                threeDSRequestInput.value = base64CReq;

                form.submit();

                this._logger.log({
                    message: '[Response] Challenge execution',
                    content: {
                        authResponse: request.authResponse,
                        cReq,
                        base64CReq
                    },
                    method: "executeChallenge",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                resolve();
            }
            catch (error) {
                this._logger.log({
                    message: '[Error] Challenge execution',
                    content: {
                        authResponse: request.authResponse,
                        error
                    },
                    method: "executeChallenge",
                    correlationId: request.correlationId,
                    level: LogLevel.Error
                });

                return reject({
                    message: error.toString()
                });
            }
        });
    }

}