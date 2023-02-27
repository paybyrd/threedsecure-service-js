import { FetchHttpClient } from "../httpClients";
import { IHttpClient } from "../httpClients/abstractions";
import { ConsoleLogger } from "../loggers";
import { ILogger } from "../loggers/abstractions";
import { Browser } from "../shared/utils";
import { IAuthRequest, IAuthResponse, IChallengeService, IDirectoryServerService, IExecuteRequest, IExecuteResponse, IPostAuthRequest, IPostAuthResponse, IThreeDSecureOptions, IThreeDSecureService } from "./abstractions";
import { IPreAuthRequest } from "./abstractions/IPreAuthRequest";
import { IPreAuthResponse } from "./abstractions/IPreAuthResponse";
import { IFrameChallengeService } from "./IFrameChallengeService";
import { IFrameDirectoryServerService } from "./IFrameDirectoryServerService";

 export class ThreeDSecureService implements IThreeDSecureService {
    private readonly _options: IThreeDSecureOptions;
    private readonly _logger: ILogger;
    private readonly _client: IHttpClient;
    private readonly _directoryServer: IDirectoryServerService;
    private readonly _challenge: IChallengeService;

    constructor(
        options: IThreeDSecureOptions,
        logger: ILogger = new ConsoleLogger(),
        httpClient: IHttpClient = new FetchHttpClient(options, logger),
        directoryServer: IDirectoryServerService = new IFrameDirectoryServerService(options, logger),
        challenge: IChallengeService = new IFrameChallengeService(options, logger)) {
        this._options = options;
        this._logger = logger;
        this._client = httpClient;
        this._directoryServer = directoryServer;
        this._challenge = challenge;
    }

     async execute(request: IExecuteRequest): Promise<IExecuteResponse> {
        let preAuthResponse = await this._preAuth(request);
        await this._directoryServer.execute(preAuthResponse);
        let authResponse = await this._auth(preAuthResponse);
        await this._challenge.execute(authResponse);
        let postAuthResponse = await this._postAuth(authResponse);
        return {
            ...postAuthResponse
        };
     }

     _preAuth(request: IPreAuthRequest): Promise<IPreAuthResponse> {
        return this._client.send<IPreAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v2/${request.id}/preAuth`,
            method: 'POST',
            body: {
                browser: Browser.create()
            }
        });
     }

     _auth(request: IAuthRequest): Promise<IAuthResponse> {
        return this._client.send<IAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v1/${request.id}/auth`,
            method: 'POST'
        });
     }

     _postAuth(request: IPostAuthRequest): Promise<IPostAuthResponse> {
        return this._client.send<IAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v2/${request.id}/postAuth`,
            method: 'POST'
        });
     }
 }

 