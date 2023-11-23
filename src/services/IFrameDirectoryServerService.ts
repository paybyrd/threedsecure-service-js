import { ILogger, LogLevel } from "../loggers/abstractions";
import { Base64Converter, HtmlElementFactory } from "../shared/utils";
import { Stopwatch } from "../shared/utils/Stopwatch";
import { IDirectoryServerExecute, IDirectoryServerOptions, IDirectoryServerService } from "./abstractions";

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

    execute(request: IDirectoryServerExecute) : Promise<void> {
        if (!request.preAuthResponse.dsMethodUrl) {
            return Promise.resolve();
        }        

        return new Promise<void>((resolve, reject) => {
            try {
                this._logger.log({
                    message: 'DirectoryServer - Start',
                    content: {
                        preAuthResponse: request
                    },
                    method: 'executeDirectoryServer',
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                this._options.container.innerHTML = '';

                const iFrame = HtmlElementFactory.createIFrame({
                    parent: this._options.container,
                    isVisible: false,
                    name: IFrameDirectoryServerService.IFRAME_NAME,
                    useDefaultStyle: !!this._options.onIFrameCreatedFn
                });
                this._options.onIFrameCreatedFn?.call(this._options, iFrame);

                this._logger.log({
                    message: 'DirectoryServer - Create iFrame',
                    method: "executeDirectoryServer",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });
                
                const form = HtmlElementFactory.createForm({
                    parent: this._options.container,
                    name: IFrameDirectoryServerService.FORM_NAME,
                    actionUrl: request.preAuthResponse.dsMethodUrl,
                    target: IFrameDirectoryServerService.IFRAME_NAME,
                    method: 'POST'
                });

                this._logger.log({
                    message: 'DirectoryServer - Create Form',
                    method: "executeDirectoryServer",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                const threeDSMethodDataInput = HtmlElementFactory.createInput({
                    parent: form,
                    name: IFrameDirectoryServerService.FORM_INPUT_NAME,
                    type: IFrameDirectoryServerService.FROM_INPUT_TYPE
                });

                this._logger.log({
                    message: 'DirectoryServer - Create Input',
                    method: "executeDirectoryServer",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                const threeDSMethodData = {
                    threeDSServerTransID: request.preAuthResponse.processId,
                    threeDSMethodNotificationURL: request.preAuthResponse.notificationUrl
                };

                const threeDSMethodDataBase64 = Base64Converter.convert(threeDSMethodData)
                threeDSMethodDataInput.value = threeDSMethodDataBase64;

                this._logger.log({
                    message: 'DirectoryServer - Prepare threeDSMethodData',
                    content: {
                        threeDSMethodData,
                        threeDSMethodDataBase64
                    },
                    method: "executeDirectoryServer",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                const stopwatch = new Stopwatch();
                const checkIFrameLoaded = () => {
                    const iframeDoc = iFrame.contentDocument || iFrame.contentWindow?.document;

                    if (iframeDoc?.readyState  == 'complete' ) {
                        this._logger.log({
                                message: `DirectoryServer - iFrame loaded in ${stopwatch.elapsed}ms`,
                                content: {
                                    iFrame: iframeDoc.body.innerText
                                },
                                method: "executeDirectoryServer",
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
                    message: 'DirectoryServer - Submit form',
                    content: {
                        threeDSMethodData,
                        threeDSMethodDataBase64
                    },
                    method: "executeDirectoryServer",
                    correlationId: request.correlationId,
                    level: LogLevel.Information
                });

                resolve();
            }
            catch (error) {
                this._logger.log({
                    message: 'DirectoryServer - Error',
                    content: {
                        preAuthResponse: request
                    },
                    error,
                    method: "directoryServerExecute",
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
            document.getElementById(IFrameDirectoryServerService.IFRAME_NAME)?.remove();
            document.getElementById(IFrameDirectoryServerService.FORM_NAME)?.remove();
            document.getElementById(IFrameDirectoryServerService.FORM_INPUT_NAME)?.remove();
        } catch {
            // Do nothing
        }
    }
}