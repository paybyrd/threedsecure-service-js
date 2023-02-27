 class ThreeDSecure implements IThreeDSecure {
    private readonly _options: IOptions;
    private readonly _logger: ILogger;
    private readonly _client: IHttpClient;
    private readonly _directoryServer: IDirectoryServer;
    private readonly _challenge: IChallenge;

    constructor(
        options: IOptions,
        logger: ILogger = new Logger(),
        retry: IRetryPolicy = new RetryPolicy(options, logger),
        httpClient: IHttpClient = new HttpClient(retry, logger),
        directoryServer: IDirectoryServer = new IFrameDirectoryServer(options, logger),
        challenge: IChallenge = new IFrameChallenge(options, logger)) {
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
            timeoutInSeconds: this._options.timeoutInSeconds,
            body: {
                browser: Browser.create()
            }
        });
     }

     _auth(request: IAuthRequest): Promise<IAuthResponse> {
        return this._client.send<IAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v1/${request.id}/auth`,
            method: 'POST',
            timeoutInSeconds: this._options.timeoutInSeconds
        });
     }

     _postAuth(request: IPostAuthRequest): Promise<IPostAuthResponse> {
        return this._client.send<IAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v2/${request.id}/postAuth`,
            method: 'POST',
            timeoutInSeconds: this._options.timeoutInSeconds
        });
     }
 }

 