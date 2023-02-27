import { ILogger } from "../loggers/abstractions";
import { Base64Converter, HtmlElementFactory } from "../shared/utils";
import { ChallengeWindowSize, IAuthResponse, IChallengeOptions, IChallengeService } from "./abstractions";

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

    execute(authResponse: IAuthResponse): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {

                 HtmlElementFactory.createIFrame({
                    parent: this._options.container,
                    name: IFrameChallengeService.IFRAME_NAME,
                    isVisible: true,
                    useDefaultStyle: !!this._options.onIFrameCreatedFn
                });
                
                const form = HtmlElementFactory.createForm({
                    parent: this._options.container,
                    name: IFrameChallengeService.FORM_NAME,
                    actionUrl: authResponse.challengeUrl,
                    target: IFrameChallengeService.IFRAME_NAME,
                    method: 'post'
                });

                const threeDSRequestInput = HtmlElementFactory.createInput({
                    parent: form,
                    name: IFrameChallengeService.CREQ_INPUT_NAME,
                    type: IFrameChallengeService.CREQ_INPUT_TYPE
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