import { IHttpClient, FetchHttpClient, IHttpClientOptions } from "@paybyrd/http-client";
import { ILogger, IRestLoggerOptions, LogLevel, RestLogger } from "@paybyrd/logger-js";
import { Browser } from "../shared/utils";
import { IAuthResponse, IChallengeService, IDirectoryServerService, IExecuteRequest, IPostAuthResponse, IThreeDSecureOptions, IThreeDSecureService } from "./abstractions";
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
        logger: ILogger = new RestLogger(ThreeDSecureService.getLoggerOptions(options)),
        httpClient: IHttpClient = new FetchHttpClient(ThreeDSecureService.getHttpClientOptions(options), logger),
        directoryServer: IDirectoryServerService = new IFrameDirectoryServerService(options, logger),
        challenge: IChallengeService = new IFrameChallengeService(options, logger)) {
        this._options = options;
        this._logger = logger;
        this._client = httpClient;
        this._directoryServer = directoryServer;
        this._challenge = challenge;
    }

     async execute(request: IExecuteRequest, correlationId = crypto.randomUUID()): Promise<IPostAuthResponse> {
        if (!request.correlationId) {
            request.correlationId = correlationId;
            this._logger.log({
                message: 'Obsolete request. CorrelationId is not set.',
                content: request,
                method: "execute",
                correlationId: request.correlationId,
                level: LogLevel.Information
            });
        }

        try {
            let preAuthResponse = await this.preAuth(request);
            await this._directoryServer.execute({
                preAuthResponse,
                correlationId: request.correlationId
            });
            let authResponse = await this.auth(request);
            await this._challenge.execute({
                authResponse,
                correlationId: request.correlationId
            });
            let postAuthResponse = await this.postAuth(request);
            await this._logger.flush();
            return postAuthResponse;
        } finally {
            this.reset();
        }
     }

     private async preAuth(request: IExecuteRequest): Promise<IPreAuthResponse> {
        this._logger.log({
            message: 'Executing PreAuth',
            content: request,
            method: "_preAuth",
            correlationId: request.correlationId,
            level: LogLevel.Information
        });
        const result = await this._client.send<IPreAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v2/${request.id}/preAuth`,
            method: 'POST',
            body: {
                browser: Browser.create()
            },
            correlationId: request.correlationId
        });
        return await result.getData();
     }

     private async auth(request: IExecuteRequest): Promise<IAuthResponse> {
        this._logger.log({
            message: 'Executing Auth',
            content: request,
            method: "_auth",
            correlationId: request.correlationId,
            level: LogLevel.Information
        });
        const result = await this._client.send<IAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v1/${request.id}/auth`,
            method: 'POST',
            correlationId: request.correlationId
        });
        return await result.getData();
     }

     private async postAuth(request: IExecuteRequest): Promise<IPostAuthResponse> {
        this._logger.log({
            message: 'Executing PostAuth',
            content: request,
            method: "_postAuth",
            correlationId: request.correlationId,
            level: LogLevel.Information
        });
        const result =  await this._client.send<IPostAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v2/${request.id}/postAuth`,
            method: 'POST',
            correlationId: request.correlationId
        });
        return await result.getData();
     }

     private reset() : void {
        this._challenge.reset();
        this._directoryServer.reset();
     }

     private static getLoggerOptions(options: IThreeDSecureOptions): IRestLoggerOptions {
        return {
            restLoggerUrl: options.logUrl,
            timeoutInSeconds: options.timeoutInSeconds || 30,
            environment: options.environment || 'Development',
            batchLogIntervalInSeconds: options.batchLogIntervalInSeconds || 5,
            service: {
                name: 'Paybyrd.ThreeDSecure.JS',
                version: '3.1.1'
            }
        };
     }

     private static getHttpClientOptions(options: IThreeDSecureOptions): IHttpClientOptions {
        return {
            timeoutInSeconds: options.timeoutInSeconds || 30,
            attemptDelayInSeconds: options.attemptDelayInSeconds || 2,
            maxAttempts: options.maxAttempts || 50
        };
     }
 }
 