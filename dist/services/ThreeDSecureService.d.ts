import { IHttpClient } from "../httpClients/abstractions";
import { ILogger } from "../loggers/abstractions";
import { IAuthRequest, IAuthResponse, IChallengeService, IDirectoryServerService, IExecuteRequest, IPostAuthRequest, IPostAuthResponse, IThreeDSecureOptions, IThreeDSecureService } from "./abstractions";
import { IPreAuthRequest } from "./abstractions/IPreAuthRequest";
import { IPreAuthResponse } from "./abstractions/IPreAuthResponse";
export declare class ThreeDSecureService implements IThreeDSecureService {
    private readonly _options;
    private readonly _logger;
    private readonly _client;
    private readonly _directoryServer;
    private readonly _challenge;
    constructor(options: IThreeDSecureOptions, logger?: ILogger, httpClient?: IHttpClient, directoryServer?: IDirectoryServerService, challenge?: IChallengeService);
    execute(request: IExecuteRequest): Promise<IPostAuthResponse>;
    _preAuth(request: IPreAuthRequest): Promise<IPreAuthResponse>;
    _auth(request: IAuthRequest): Promise<IAuthResponse>;
    _postAuth(request: IPostAuthRequest): Promise<IPostAuthResponse>;
}
