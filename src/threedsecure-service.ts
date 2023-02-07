import {
  FORM_CHALLENGE_NAME,
  FORM_DSMETHOD_NAME,
  IFRAME_CHALLENGE_NAME,
  IFRAME_DSMETHOD_NAME,
} from "./constants";
import {
  AuthResponse,
  CreateAndExecuteRequest,
  CreateResponse,
  PostAuthV1Response,
  PostAuthV2Response,
  PreAuthResponse,
  RetryEvents,
  ThreeDSecureServiceOptions,
  Response,
} from "./types";
import {
  convertToBase64UriJson,
  getBrowserData,
  isTransientStatusCode,
  noop,
} from "./utils";

export default class ThreeDSecureService {
  private readonly _onProgress: NonNullable<
    ThreeDSecureServiceOptions["onProgressFn"]
  >;

  private readonly _maxAttempts: number;

  private readonly _attemptDelay: number;

  private readonly _threeDSecureUrl: string;

  private readonly _culture: string;

  private readonly _container: HTMLElement;

  private readonly _onIFrameCreatedFn: ThreeDSecureServiceOptions["onIFrameCreatedFn"];

  private _items: HTMLElement[] = [];

  constructor({
    threeDSecureUrl,
    container,
    maxAttempts,
    attemptDelay,
    culture,
    onProgressFn,
    onIFrameCreatedFn,
    onContainerCreatedFn,
  }: ThreeDSecureServiceOptions) {
    this._onProgress = onProgressFn || noop;
    this._maxAttempts = maxAttempts || 50;
    this._attemptDelay = attemptDelay || 2000;
    this._threeDSecureUrl =
      threeDSecureUrl || "https://threedsecure.paybyrd.com";
    this._culture = culture || "en-US";
    this._container = container || document.body;
    this._onIFrameCreatedFn = onIFrameCreatedFn;

    if (onContainerCreatedFn) {
      onContainerCreatedFn(this._container);
    } else {
      const containerStyle = this._container.style;

      containerStyle.position = "relative";
      containerStyle.overflow = "hidden";
    }
  }

  createAndExecute(
    initiatePayment: CreateAndExecuteRequest,
    correlationId: string = crypto.randomUUID()
  ) {
    return this.create(initiatePayment, correlationId)
      .then((createResponse) => this.preAuth(createResponse, correlationId))
      .then((preAuthResponse) => this.auth(preAuthResponse, correlationId))
      .then((authResponse) => this.postAuth(authResponse, correlationId))
      .then((postAuthResponse) => ({
        ...postAuthResponse,
        correlationId,
      }))
      .catch((error) => {
        this._onProgress({
          type: "event:error",
          error,
        });

        return Promise.reject({
          ...error,
          correlationId,
        });
      })
      .finally(this._destroy.bind(this));
  }

  execute(
    createResponse: CreateResponse,
    correlationId: string = crypto.randomUUID()
  ) {
    return this.preAuthV2(createResponse, correlationId)
      .then((preAuthResponse) => this.auth(preAuthResponse, correlationId))
      .then((authResponse) => this.postAuthV2(authResponse, correlationId))
      .then((postAuthResponse) => ({
        ...postAuthResponse,
        correlationId,
      }))
      .catch((error) => {
        this._onProgress({
          type: "event:error",
          error,
        });

        return this.postAuthV2(createResponse, correlationId).catch((error) => {
          this._onProgress({
            type: "event:error",
            error,
          });

          return Promise.reject({
            ...error,
            correlationId,
          });
        });
      })
      .finally(this._destroy.bind(this));
  }

  create(initiatePayment: CreateAndExecuteRequest, correlationId: string) {
    return this._retry<CreateResponse>(
      "create",
      "/api/v1",
      "POST",
      correlationId,
      {
        ...initiatePayment,
        browser: getBrowserData(),
      }
    );
  }

  preAuthV2({ id }: CreateResponse, correlationId: string) {
    return this._retry<PreAuthResponse>(
      "preAuth",
      `/api/v2/${id}/preauth`,
      "POST",
      correlationId,
      {
        browser: getBrowserData(),
      }
    ).then((preAuthResponse) => {
      if (preAuthResponse.isDsMethodRequired) {
        this._executeDsMethod(preAuthResponse);
      }

      return {
        id,
        ...preAuthResponse,
      };
    });
  }

  preAuth({ id }: CreateResponse, correlationId: string) {
    return this._retry<PreAuthResponse>(
      "preAuth",
      `/api/v1/${id}/preauth`,
      "POST",
      correlationId
    ).then((preAuthResponse) => {
      if (preAuthResponse.isDsMethodRequired) {
        this._executeDsMethod(preAuthResponse);
      }

      return {
        id,
        ...preAuthResponse,
      };
    });
  }

  auth({ id }: CreateResponse, correlationId: string) {
    return this._retry<AuthResponse>(
      "auth",
      `/api/v1/${id}/auth`,
      "POST",
      correlationId
    ).then((authResponse) => {
      if (authResponse.isChallengeRequired) {
        if (authResponse.challengeVersion === "1.0.0") {
          this._executeChallengeV1(authResponse);
        } else {
          this._executeChallengeV2(authResponse);
        }
      }

      return {
        id,
        ...authResponse,
      };
    });
  }

  postAuth({ id }: CreateResponse, correlationId: string) {
    return this._retry<PostAuthV1Response>(
      "postAuth",
      `/api/v1/${id}/postAuth`,
      "POST",
      correlationId
    );
  }

  postAuthV2({ id }: CreateResponse, correlationId: string) {
    return this._retry<PostAuthV2Response>(
      "postAuth",
      `/api/v2/${id}/postAuth`,
      "POST",
      correlationId
    ).then((postAuthResponse) => {
      if (postAuthResponse.status !== "Authorized") {
        this._onProgress({
          type: "event:error",
          error: postAuthResponse,
        });
      }

      return postAuthResponse;
    });
  }

  private _executeDsMethod(preAuthResponse: PreAuthResponse) {
    this._onProgress({
      type: "event:dsMethod:start",
    });

    const form = this._createForm(
      FORM_DSMETHOD_NAME,
      preAuthResponse.dsMethodUrl,
      this._createIFrame(IFRAME_DSMETHOD_NAME),
      "post"
    );

    const threeDSMethodDataInput = this._createInput(
      form,
      "threeDSMethodData",
      "hidden"
    );

    threeDSMethodDataInput.value = convertToBase64UriJson({
      threeDSServerTransID: preAuthResponse.processId,
      threeDSMethodNotificationURL: preAuthResponse.notificationUrl,
    });

    form.submit();

    this._onProgress({
      type: "event:dsMethod:success",
    });
  }

  private _executeChallengeV1(authResponse: AuthResponse) {
    this._onProgress({
      type: "event:challenge:v1:start",
    });

    const inputType = "hidden";

    const form = this._createForm(
      FORM_CHALLENGE_NAME,
      authResponse.challengeUrl,
      this._createIFrame(IFRAME_CHALLENGE_NAME, true),
      "post"
    );

    const paReqInput = this._createInput(form, "PaReq", inputType);

    const termUrlInput = this._createInput(form, "TermUrl", inputType);

    paReqInput.value = authResponse.preAuthRequest;
    termUrlInput.value = authResponse.notificationUrl;

    form.submit();

    this._onProgress({
      type: "event:challenge:v1:success",
    });
  }

  private _executeChallengeV2(authResponse: AuthResponse) {
    this._onProgress({
      type: "event:challenge:v2:start",
    });

    const inputType = "hidden";

    const form = this._createForm(
      FORM_CHALLENGE_NAME,
      authResponse.challengeUrl,
      this._createIFrame(IFRAME_CHALLENGE_NAME, true),
      "post"
    );

    this._createInput(form, "threeDSSessionData", inputType);

    const threeDSRequestInput = this._createInput(form, "creq", inputType);

    threeDSRequestInput.value = convertToBase64UriJson({
      threeDSServerTransID: authResponse.processId,
      acsTransID: authResponse.challengeId,
      messageVersion: authResponse.challengeVersion,
      messageType: "CReq",
      challengeWindowSize: "01",
    });

    form.submit();

    this._onProgress({
      type: "event:challenge:v2:success",
    });
  }

  private _delay(timeout: number) {
    this._onProgress({
      type: "event:delay:start",
      data: {
        timeout,
      },
    });

    return new Promise<true>((resolve) => {
      setTimeout(() => {
        this._onProgress({
          type: "event:delay:end",
          data: {
            timeout,
          },
        });

        resolve(true);
      }, timeout);
    });
  }

  private _createForm(
    name: string,
    action: string,
    target: string,
    method: string
  ) {
    const form = document.createElement("form");

    form.id = name;
    form.name = name;
    form.action = action;
    form.target = target;
    form.method = method;

    this._items.push(form);

    this._container.appendChild(form);

    return form;
  }

  private _createInput(form: HTMLFormElement, name: string, type: string) {
    const input = document.createElement("input");

    input.id = name;
    input.name = name;
    input.type = type;

    form.appendChild(input);

    return input;
  }

  private _createIFrame(name: string, visible?: boolean) {
    const iframe = document.createElement("iframe");

    iframe.id = name;
    iframe.name = name;

    if (this._onIFrameCreatedFn) {
      this._onIFrameCreatedFn(iframe);
    } else {
      const iframeStyle = iframe.style;

      iframeStyle.border = "none";
      iframeStyle.position = "absolute";
      iframeStyle.top = "0";
      iframeStyle.left = "0";
      iframeStyle.bottom = "0";
      iframeStyle.right = "0";
      iframe.width = "100%";
      iframe.height = "100%";
    }

    iframe.style.opacity = visible ? "1" : "0";

    this._items.push(iframe);

    this._container.appendChild(iframe);

    return name;
  }

  private _retry<T>(
    eventType: RetryEvents,
    path: string,
    method: string,
    correlationId: string,
    payload?: any
  ) {
    const ev = `event:${eventType}` as const;

    return new Promise<T>(async (resolve, reject) => {
      let response: Response<T>;

      let attempt = 1;

      do {
        this._onProgress({
          type: `${ev}:start`,
          data: { attempt },
        });

        response = await this._sendRequest<T>(
          path,
          method,
          correlationId,
          attempt,
          payload
        );

        if (response.isSuccess) {
          this._onProgress({
            type: `${ev}:success`,
            data: response.data.data,
          });

          resolve(response.data.data);

          return;
        }

        this._onProgress({
          type: `${ev}:error`,
          error: response.data?.error,
          data: {
            statusCode: response.status,
          },
        });

        attempt++;
      } while (
        attempt <= this._maxAttempts &&
        isTransientStatusCode(response) &&
        (await this._delay(this._attemptDelay))
      );

      this._onProgress({
        type: `${ev}:fail`,
        error: response.data.error,
      });

      reject(
        response.data.error || {
          message: "Unhandled error",
        }
      );
    });
  }

  private async _sendRequest<T>(
    path: string,
    method: string,
    correlationId: string,
    attempt: number,
    payload?: any
  ): Promise<Response<T>> {
    try {
      const abortController = new AbortController();

      const timeoutId = setTimeout(() => abortController.abort(), 30000);

      const response = await fetch(`${this._threeDSecureUrl}${path}`, {
        headers: {
          correlationId,
          "x-attempt": String(attempt),
          "x-max-attempt": String(this._maxAttempts),
          accept: "application/json",
          "content-type": "application/json",
          "accept-language": this._culture,
        },
        keepalive: true,
        body: JSON.stringify(payload),
        method,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      return {
        isSuccess: response.ok,
        status: response.status,
        data: await response.json(),
      };
    } catch (error) {
      return {
        isSuccess: false,
        status: 500,
        data: {
          message: error.toString(),
        } as any,
      };
    }
  }

  private _destroy() {
    this._items.forEach((item) => {
      item.remove();
    });

    this._items = [];
  }
}
