import { IHttpClient } from "../httpClients/abstractions";
import { ILogger } from "../loggers/abstractions";
import { IChallengeService, IDirectoryServerService, IExecuteRequest, IPostAuthResponse, IThreeDSecureOptions, IThreeDSecureService } from "./abstractions";
export declare class ThreeDSecureService implements IThreeDSecureService {
    private readonly _options;
    private readonly _logger;
    private readonly _client;
    private readonly _directoryServer;
    private readonly _challenge;
    constructor(options: IThreeDSecureOptions, logger?: ILogger, httpClient?: IHttpClient, directoryServer?: IDirectoryServerService, challenge?: IChallengeService);
    execute(request: IExecuteRequest): Promise<IPostAuthResponse>;
    private preAuth;
    private auth;
    private postAuth;
}
