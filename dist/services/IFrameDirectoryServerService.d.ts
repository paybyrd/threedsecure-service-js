import { ILogger } from "../loggers/abstractions";
import { IDirectoryServerOptions, IDirectoryServerService } from "./abstractions";
import { IPreAuthResponse } from "./abstractions/IPreAuthResponse";
export declare class IFrameDirectoryServerService implements IDirectoryServerService {
    private static readonly IFRAME_NAME;
    private static readonly FORM_NAME;
    private static readonly FORM_INPUT_NAME;
    private static readonly FROM_INPUT_TYPE;
    private readonly _logger;
    private readonly _options;
    constructor(options: IDirectoryServerOptions, logger: ILogger);
    execute(preAuthResponse: IPreAuthResponse): Promise<void>;
}
