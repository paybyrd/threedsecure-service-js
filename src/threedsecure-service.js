export default class ThreeDSecureService {
    constructor({
        threeDSecureUrl,
        container,
        maxAttempts,
        attemptDelay,
        culture,
        onProgressFn,
        onIFrameCreatedFn,
        onContainerCreatedFn
    }) {
        this._onProgressFn = onProgressFn;
        this._maxAttempts = maxAttempts || 50;
        this._attemptDelay = attemptDelay || 2000;
        this._threeDSecureUrl = threeDSecureUrl || 'https://threedsecure.paybyrd.com';
        this._culture = culture || 'en-US';
        this._container = container || document.body;
        this._onIFrameCreatedFn = onIFrameCreatedFn;
        this._onContainerCreatedFn = onContainerCreatedFn;

        this.IFRAME_DSMETHOD_NAME = 'threeDSMethodIframe';
        this.FORM_DSMETHOD_NAME = 'threeDSMethodForm';
        this.IFRAME_CHALLENGE_NAME = 'challengeIframe';
        this.FORM_CHALLENGE_NAME = 'challengeForm';

        this._fixContainer();
    }

    createAndExecute(initiatePayment, correlationId = crypto.randomUUID()) {
        return this.create(initiatePayment, correlationId)
            .then((createResponse) => this.preAuth(createResponse, correlationId))
            .then((preAuthResponse) => this.auth(preAuthResponse, correlationId))
            .then((authResponse) => this.postAuth(authResponse, correlationId))
            .then(postAuthResponse => {
                return {
                    ...postAuthResponse,
                    correlationId
                };
            })
            .catch(error => {
                return Promise.reject({
                    ...error,
                    correlationId
                });
            })
            .finally(this._destroy.bind(this));
    }

    execute(createResponse, correlationId = crypto.randomUUID()) {
        return this.preAuthWithBrowser(createResponse, correlationId)
            .then((preAuthResponse) => this.auth(preAuthResponse, correlationId))
            .then((authResponse) => this.postAuthV2(authResponse, correlationId))
            .then(postAuthResponse => {
                return {
                    ...postAuthResponse,
                    correlationId
                };
            })
            .catch(error => {
                return Promise.reject({
                    ...error,
                    correlationId
                });
            })
            .finally(this._destroy.bind(this));
    }

    create(initiatePayment, correlationId) {
        return this._retry(
            this._isTransientStatusCode.bind(this),
            () => this._sendRequest({
                path: '/api/v1',
                method: 'POST',
                payload: {
                    ...initiatePayment,
                    browser: this._getBrowserData()
                },
                correlationId
            }),
            'event:create');
    }

    preAuthWithBrowser(preAuthRequest, correlationId){
        return this.preAuth({
            ...preAuthRequest,
            browser: this._getBrowserData()
        },
        correlationId
        );
    }

    preAuth(preAuthRequest, correlationId) {
        return this._retry(
            this._isTransientStatusCode.bind(this),
            () => this._sendRequest({
                path: `/api/v1/${preAuthRequest.id}/preauth`,
                payload: {browser: preAuthRequest.browser},
                method: 'POST',
                correlationId
            }),
            'event:preAuth'
        )
            .then(preAuthResponse => {
                if (!preAuthResponse.isDsMethodRequired) {
                    return preAuthResponse;
                }
                return this._executeDsMethod(preAuthResponse)
                    .then(() => preAuthResponse);
            });
    }

    auth(authRequest, correlationId) {
        return this._retry(
            this._isTransientStatusCode.bind(this),
            () => this._sendRequest({
                path: `/api/v1/${authRequest.id}/auth`,
                method: 'POST',
                correlationId
            }),
            'event:auth'
        )
            .then(authResponse => {
                if (!authResponse.isChallengeRequired) {
                    return authResponse;
                }
                return (
                    authResponse.challengeVersion === '1.0.0'
                        ? this._executeChallengeV1(authResponse)
                        : this._executeChallengeV2(authResponse))
                    .then(() => authResponse);
            });
    }

    postAuth(postAuthRequest, correlationId) {
        return this._retry(
            this._isTransientStatusCode.bind(this),
            () => this._sendRequest({
                path: `/api/v1/${postAuthRequest.id}/postAuth`,
                method: 'POST',
                correlationId
            }),
            'event:postAuth');
    }

    postAuthV2(postAuthRequest, correlationId) {
        return this._retry(
            this._isTransientStatusCode.bind(this),
            () => this._sendRequest({
                path: `/api/v2/${postAuthRequest.id}/postAuth`,
                method: 'POST',
                correlationId
            }),
            'event:postAuth');
    }

    _executeDsMethod(preAuthResponse) {
        return new Promise((resolve, reject) => {
            try {
                this._onProgress({
                    type: 'event:dsMethod:start'
                });
                const iframeName = this.IFRAME_DSMETHOD_NAME;
                const formName = this.FORM_DSMETHOD_NAME;
                const inputName = 'threeDSMethodData';
                const inputType = 'hidden';

                this._createIFrame(iframeName, false);
                const form = this._createForm(formName, preAuthResponse.dsMethodUrl, iframeName);
                const threeDSMethodDataInput = this._createInput(form, inputName, inputType);

                const threeDSMethodData = {
                    threeDSServerTransID: preAuthResponse.processId,
                    threeDSMethodNotificationURL: preAuthResponse.notificationUrl
                };

                threeDSMethodDataInput.value = this._convertToBase64UriJson(threeDSMethodData);
                form.submit();

                this._onProgress({
                    type: 'event:dsMethod:success'
                });
                resolve();
            }
            catch (error) {
                this._onProgress({
                    type: 'event:dsMethod:fail'
                });
                return reject({
                    message: error.toString()
                });
            }
        });
    }

    _executeChallengeV1(authResponse) {
        return new Promise((resolve, reject) => {
            try {
                this._onProgress({
                    type: 'event:challenge:v1:start'
                });

                const iframeName = this.IFRAME_CHALLENGE_NAME;
                const formName = this.FORM_CHALLENGE_NAME;
                const paReqInputName = 'PaReq';
                const termUrlInputName = 'TermUrl';
                const inputType = 'hidden';

                this._createIFrame(iframeName);
                const form = this._createForm(
                    formName,
                    authResponse.challengeUrl,
                    iframeName,
                    'post'
                );

                const paReqInput = this._createInput(
                    form,
                    paReqInputName,
                    inputType
                );

                const termUrlInput = this._createInput(
                    form,
                    termUrlInputName,
                    inputType
                );

                paReqInput.value = authResponse.preAuthRequest;
                termUrlInput.value = authResponse.notificationUrl;

                form.submit();

                resolve();

                this._onProgress({
                    type: 'event:challenge:v1:success'
                });
            }
            catch (error) {
                this._onProgress({
                    type: 'event:challenge:v1:fail',
                    error
                });
                return reject({
                    message: error.toString()
                });
            }
        });
    }

    _executeChallengeV2(authResponse) {
        return new Promise((resolve, reject) => {
            try {
                this._onProgress({
                    type: 'event:challenge:v2:start'
                });

                const iframeName = this.IFRAME_CHALLENGE_NAME;
                const formName = this.FORM_CHALLENGE_NAME;
                const threeDSSessionDataInputName = 'threeDSSessionData';
                const threeDSRequestInputName = 'creq';
                const inputType = 'hidden';

                this._createIFrame(iframeName);
                const form = this._createForm(
                    formName,
                    authResponse.challengeUrl,
                    iframeName,
                    'post'
                );
                this._createInput(
                    form,
                    threeDSSessionDataInputName,
                    inputType);
                const threeDSRequestInput = this._createInput(
                    form,
                    threeDSRequestInputName,
                    inputType
                );

                const cReq = {
                    threeDSServerTransID: authResponse.processId,
                    acsTransID: authResponse.challengeId,
                    messageVersion: authResponse.challengeVersion,
                    messageType: "CReq",
                    challengeWindowSize: "01"
                };

                threeDSRequestInput.value = this._convertToBase64UriJson(cReq);

                form.submit();

                resolve();
                this._onProgress({
                    type: 'event:challenge:v2:success'
                });
            }
            catch (error) {
                this._onProgress({
                    type: 'event:challenge:v2:fail',
                    error
                });
                return reject({
                    message: error.toString()
                });
            }
        });
    }

    _delay(timeout) {
        this._onProgress({
            type: 'event:delay:start',
            data: {
                timeout
            }
        });
        return new Promise((resolve, _) => {
            setTimeout(() => {
                this._onProgress({
                    type: 'event:delay:end',
                    data: {
                        timeout
                    }
                });
                resolve();
            }, timeout);
        });
    }

    _fixContainer() {
        if (this._onContainerCreatedFn) {
            this._onContainerCreatedFn(this._container);
            return;
        }
        this._container.setAttribute('style', 'position: relative; overflow: hidden;');
    }

    _createForm(name, action, target, method = 'POST') {
        const form = document.createElement('form');
        form.id = name;
        form.name = name;
        form.action = action;
        form.target = target;
        form.method = method;
        this._container.appendChild(form);

        return form;
    }

    _createInput(form, name, type) {
        const input = document.createElement('input');
        input.id = name;
        input.name = name;
        input.type = type;
        form.appendChild(input);

        return input;
    }

    _createIFrame(name, visible = true) {
        const iframe = document.createElement('iframe');
        iframe.id = name;
        iframe.name = name;

        if (this._onIFrameCreatedFn) {
            this._onIFrameCreatedFn(iframe);
            iframe.style.opacity = visible ? 1 : 0;
        }
        else {
            iframe.setAttribute('style', `border: none;position: absolute; top: 0; left: 0; bottom: 0; right: 0; width: 100%; height: 100%;opacity: ${visible ? '1' : '0'}`);
        }

        this._container.appendChild(iframe);

        return iframe;
    }

    _getBrowserData() {
        const allowedBrowserColorDepth = [48, 32, 24, 16, 15, 8, 4, 1];
        const colorDepth = allowedBrowserColorDepth.find(x => x <= screen.colorDepth);
        return {
            javaEnabled: navigator.javaEnabled(),
            javascriptEnabled: true,
            language: navigator.language,
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timezoneOffset: new Date().getTimezoneOffset(),
            colorDepth: colorDepth,
            acceptHeader: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        };
    }

    _retry(conditionFn, executeFn, eventType) {
        return new Promise(async (resolve, reject) => {
            let response = null;
            let attempts = this._maxAttempts;
            do {
                this._onProgress({
                    type: `${eventType}:start`,
                    data: {
                        attempt: this._maxAttempts - attempts + 1
                    }
                });
                try {
                    response = await executeFn();
                }
                catch (error) {
                    this._onProgress({
                        type: `${eventType}:error`,
                        error: error.data?.error,
                        data: {
                            statusCode: error.status
                        }
                    });
                    response = error;
                }

                if (response.status >= 200 && response.status < 300) {
                    this._onProgress({
                        type: `${eventType}:success`,
                        data: response.data.data
                    });
                    resolve(response.data.data);
                    return;
                }

                attempts--;
                await this._delay(this._attemptDelay);
            } while (attempts > 0 && conditionFn(response));

            this._onProgress({
                type: `${eventType}:fail`,
                error: response.data?.error
            });

            reject(response.data?.error ?? {
                message: 'Unhandled error'
            });
        });
    }

    _onProgress(event) {
        this._safeExecute(() => this._onProgressFn?.call(null, event));
    }

    _isTransientStatusCode(response) {
        return this._safeExecute(() =>
            response.status === 409
            || response.status === 424
            || response.status == 500
            || response.status == 503
            || response.status === 504,
            true);
    }

    _convertToBase64UriJson(data) {
        const json = JSON.stringify(data);
        const base64Json = btoa(json);
        const encodedBase64Json = base64Json
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        return encodedBase64Json;
    }

    _sendRequest({ path, method, payload, correlationId }) {
        const tryParse = (json) => {
            if (json === '') {
                return null;
            }
            return this._safeExecute(() => JSON.parse(json), null);
        }

        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            const url = new URL(path, this._threeDSecureUrl);

            xhr.open(method, url.toString());

            const TIMEOUT_IN_MILLISECONDS = 30000;
            xhr.timeout = TIMEOUT_IN_MILLISECONDS;

            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Accept-Language", this._culture);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("CorrelationId", correlationId);

            xhr.onload = () => {
                try {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({
                            status: xhr.status,
                            data: tryParse(xhr.responseText)
                        });
                        return;
                    }
                    reject({
                        status: xhr.status,
                        data: tryParse(xhr.responseText)
                    });
                }
                catch (error) {
                    console.log(error);
                    reject({
                        status: 500,
                        data: {
                            message: error.toString()
                        }
                    });
                }
            };

            xhr.onerror = () => {
                try {
                    reject({
                        status: xhr.status,
                        data: tryParse(xhr.responseText)
                    });
                }
                catch (error) {
                    reject({
                        status: 500,
                        data: {
                            message: error.toString()
                        }
                    });
                }
            };

            xhr.ontimeout = () => {
                reject({
                    status: 503,
                    data: {
                        message: 'Service timeout'
                    }
                });
            };

            const json = this._safeExecute(() => JSON.stringify(payload), '{}');

            xhr.send(json);
        });
    }

    _destroy() {
        this._safeExecute(() => document.getElementById(this.IFRAME_DSMETHOD_NAME)?.remove());
        this._safeExecute(() => document.getElementById(this.FORM_DSMETHOD_NAME)?.remove());
        this._safeExecute(() => document.getElementById(this.IFRAME_CHALLENGE_NAME)?.remove());
        this._safeExecute(() => document.getElementById(this.FORM_CHALLENGE_NAME)?.remove());
    }

    _safeExecute(action, defaultResult) {
        try {
            return action();
        } catch (error) {
            console.log(error);
            return defaultResult;
        }
    }
}