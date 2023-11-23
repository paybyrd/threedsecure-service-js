import { ILogger, LogLevel } from "@paybyrd/logger-js";
import { Base64Converter, HtmlElementFactory } from "../shared/utils";
import { Stopwatch } from "../shared/utils/Stopwatch";
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
                    message: 'Challenge - Start',
                    content: {
                        authResponse: request.authResponse
                    },
                    method: "executeChallenge",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                this._options.container.innerHTML = '';

                const iFrame = HtmlElementFactory.createIFrame({
                    parent: this._options.container,
                    name: IFrameChallengeService.IFRAME_NAME,
                    isVisible: true,
                    useDefaultStyle: !!this._options.onIFrameCreatedFn,
                    onCreatedFn: this._options.onIFrameCreatedFn,
                    onReadyFn: this._options.onIFrameReadyFn
                });

                this._logger.log({
                    message: 'Challenge - Create iFrame',
                    method: "executeChallenge",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });
                
                const form = HtmlElementFactory.createForm({
                    parent: this._options.container,
                    name: IFrameChallengeService.FORM_NAME,
                    actionUrl: request.authResponse.challengeUrl,
                    target: IFrameChallengeService.IFRAME_NAME,
                    method: 'post'
                });

                this._logger.log({
                    message: 'Challenge - Create form',
                    method: "executeChallenge",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                const threeDSRequestInput = HtmlElementFactory.createInput({
                    parent: form,
                    name: IFrameChallengeService.CREQ_INPUT_NAME,
                    type: IFrameChallengeService.CREQ_INPUT_TYPE
                });

                this._logger.log({
                    message: 'Challenge - Create input',
                    method: "executeChallenge",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
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

                this._logger.log({
                    message: 'Challenge - Prepare cReq',
                    content: {
                        cReq,
                        base64CReq
                    },
                    method: "executeChallenge",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                const stopwatch = new Stopwatch();
                const checkIFrameLoaded = () => {
                    const iframeDoc = iFrame.contentDocument || iFrame.contentWindow?.document;

                    if (iframeDoc?.readyState  == 'complete' ) {
                        this._logger.log({
                                message: `Challenge - iFrame loaded in ${stopwatch.elapsed}ms`,
                                content: {
                                    iFrame: iframeDoc.body.innerText
                                },
                                method: "executeChallenge",
                                correlationId: request.correlationId,
                                level: LogLevel.Information
                            });
                        
                        return;
                    } 
                
                    // If we are here, it is not loaded. Set things up so we check the status again in 250 milliseconds
                    setTimeout(checkIFrameLoaded, 100);
                }

                form.submit();
                
                setTimeout(checkIFrameLoaded, 100);

                this._logger.log({
                    message: 'Challenge - Submit form',
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
                    message: 'Challenge - error',
                    content: {
                        authResponse: request.authResponse
                    },
                    error: error,
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

    reset(): void {
        try {
            document.getElementById(IFrameChallengeService.IFRAME_NAME)?.remove();
            document.getElementById(IFrameChallengeService.FORM_NAME)?.remove();
            document.getElementById(IFrameChallengeService.CREQ_INPUT_NAME)?.remove();
        } catch {
            // Do nothing
        }
    }
}