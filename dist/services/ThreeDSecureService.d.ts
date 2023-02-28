import { IHttpClient } from "../httpClients/abstractions";
import { ILogger } from "../loggers/abstractions";
import { IAuthResponse, IChallengeService, IDirectoryServerService, IExecuteRequest, IPostAuthResponse, IThreeDSecureOptions, IThreeDSecureService } from "./abstractions";
import { IPreAuthResponse } from "./abstractions/IPreAuthResponse";
export declare class ThreeDSecureService implements IThreeDSecureService {
    private readonly _options;
    private readonly _logger;
    private readonly _client;
    private readonly _directoryServer;
    private readonly _challenge;
    constructor(options: IThreeDSecureOptions, logger?: ILogger, httpClient?: IHttpClient, directoryServer?: IDirectoryServerService, challenge?: IChallengeService);
    execute(request: IExecuteRequest): Promise<IPostAuthResponse>;
    _preAuth(request: IExecuteRequest): Promise<IPreAuthResponse>;
    _auth(request: IExecuteRequest): Promise<IAuthResponse>;
    _postAuth(request: IExecuteRequest): Promise<IPostAuthResponse>;
}
