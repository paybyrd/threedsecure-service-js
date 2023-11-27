import { IHttpClient, FetchHttpClient, IHttpClientOptions } from "@paybyrd/http-client";
import { ILogger, IRestLoggerOptions, LogLevel, RestLogger } from "@paybyrd/logger-js";
import { Browser } from "../shared/utils";
import { IAuthResponse, IChallengeService, IDirectoryServerService, IExecuteRequest, IPostAuthResponse, IThreeDSecureOptions, IThreeDSecureService } from "./abstractions";
import { IPreAuthResponse } from "./abstractions/IPreAuthResponse";
import { IFrameChallengeService } from "./IFrameChallengeService";
import { IFrameDirectoryServerService } from "./IFrameDirectoryServerService";
import { IObservable, IObserver, IEvent } from "../observer/abstractions";

 export class ThreeDSecureService implements IThreeDSecureService, IObservable {
    private readonly _options: IThreeDSecureOptions;
    private readonly _logger: ILogger;
    private readonly _client: IHttpClient;
    private readonly _directoryServer: IDirectoryServerService;
    private readonly _challenge: IChallengeService;
    private readonly _observers: IObserver[] = [];

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

     subscribe(observer: IObserver): void {
         this._observers.push(observer);
     }
     
     unsubscribe(observer: IObserver): void {
        const index = this._observers.indexOf(observer);
        if (index > -1) {
            this._observers.splice(index, 1);
        }
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
            return postAuthResponse;
        } finally {
            this.reset();
            await this._logger.flush();
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
        this.notifyAll({
            name: 'preAuth:started',
            data: request
        });
        const result = await this._client.send<IPreAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v2/${request.id}/preAuth`,
            method: 'POST',
            body: {
                browser: Browser.create()
            },
            correlationId: request.correlationId
        });
        this.notifyAll({
            name: 'preAuth:completed',
            data: result
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
        this.notifyAll({
            name: 'auth:started',
            data: request
        });
        const result = await this._client.send<IAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v1/${request.id}/auth`,
            method: 'POST',
            correlationId: request.correlationId
        });
        this.notifyAll({
            name: 'auth:completed',
            data: result
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
        this.notifyAll({
            name: 'postAuth:completed',
            data: request
        });
        const result =  await this._client.send<IPostAuthResponse>({
            url: `${this._options.threeDSecureUrl}/api/v2/${request.id}/postAuth`,
            method: 'POST',
            correlationId: request.correlationId
        });
        this.notifyAll({
            name: 'postAuth:completed',
            data: result
        });
        return await result.getData();
     }

     private reset() : void {
        this.notifyAll({
            name: 'reset:started'
        });
        this._challenge.reset();
        this._directoryServer.reset();
        this.notifyAll({
            name: 'reset:completed'
        });
     }

     private notifyAll(event: IEvent): void {
        this._observers.forEach(observer => observer.notify(event));
     }

     private static getLoggerOptions(options: IThreeDSecureOptions): IRestLoggerOptions {
        return {
            restLoggerUrl: options.logUrl,
            timeoutInSeconds: options.timeoutInSeconds || 30,
            environment: options.environment || 'Production',
            batchLogIntervalInSeconds: options.batchLogIntervalInSeconds || 5,
            service: {
                name: 'Paybyrd.ThreeDSecure.JS',
                version: '3.2.1'
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
 