# ThreeDSecure Service

A library to simplify the implementation of 3DS flow using Paybyrd API.

## How to install

```npm i @paybyrd/threedsecure-service```

## How to configure ThreeDSecureService

### Parameters

* **options:** The service configurations object.
* **logger:** A notification object to log what is happening inside the service. **DEFAULT: RestLogger**
* **httpClient:** A client used to send the API requests.
* **directoryServer:** A service to allow customizations to the Directory Server.
* **challenge:** A service to allow customizations to the Challenge.

#### The options param

* **container:** HTML Element where the iframe needed to execute the challenge will be created. The iframe will be resizable as the container. 
**DEFAULT: document.body**
* **challengeWindowSize:** The challenge window size configuration.
* **onIFrameCreatedFn:** A notification function to allow customizations to the iframe created.
* **onIFrameReadyFn:** A notification function to allow customizations to the iframe ready.
* **onContainerCreatedFn:** A notification function to allow customizations to the container created. If the container is passed, the function will be dispatched anyway.
* **threeDSecureUrl:** Paybyrd ThreeDSecure API base URL. **DEFAULT: https://threedsecure.paybyrd.com**
* **culture**: The culture that should be used for API responses. **DEFAULT: en-US**
* **maxAttempts:** The max attempts when the API returns transient errors, like 409, 404 or 504 status codes. **DEFAULT: 50**
* **attemptDelayInSeconds:** The amount of time in milliseconds to wait for the next attempt when some transient error happens.**DEFAULT: 2**
* **timeoutInSeconds:** The amount of time in seconds to wait for the API response. **DEFAULT: 30**
* **logUrl:** A Log API base URL used to send the logs.**DEFAULT: null**
* **batchLogIntervalInSeconds:** The amount of time in seconds to send batch logs to the rest logger. **DEFAULT: 5**


```js
const container = document.getElementById('container-3ds');
const threeDSecureUrl = 'https://threedsecure.paybyrd.com';
const maxAttempts = 50;
const attemptDelay = 2000;
const culture = 'en-US';

const threeDSService = new ThreeDSecureService({
    container,
    threeDSecureUrl,
    maxAttempts,
    attemptDelay,
    culture
});
```

### How to send the paymentRequest

First of all, we truly recommend that you use the 3DS flow using the Order feature, where you can take a look [here](https://docs.paybyrd.com/docs/hosted-form-v2). When you create the order, we will return a **checkoutKey** that must be used for authentication.

```js
const createPaymentRequest = {
    type: 'Card',
    card: {
        cardNumber: '5500000000000001',
        cardHolder: 'PAYBYRD CARD HOLDER',
        cardExpiration: '07/30',
        cvv: '123'
    }
};

const createPaymentResponse = await axios.post(
    `https://gateway.paybyrd.com/api/v2/payment?checkoutKey=${checkoutKey}`,
    createPaymentRequest);
```

## How to send the request

### Parameters
* **id:** The "id" of threeDSecure node from the payment creation response.
* **correlationId:** The "requestId" from the payment creation response.

```js
const threeDSRequest = {
        id: createPaymentResponse.threeDSecure.id,
        correlationId: createPaymentResponse.requestId
    };
const threeDSResponse = await threeDSecureService.execute(threeDSRequest);
```

### How to identify errors

```js
try {
    const threeDSResponse = await threeDSecureService.execute(request);
} catch (error) {
    // Show the error.message in your website
}
```

## Main flow

In the main flow, Paybyrd will deal with everystep.

```mermaid

graph
    subgraph ClientServer[Client server]
        PaymentAPI[Payment API]
    end
    subgraph Customer device
        3DSPage[3DS page]
        ThreeDSecureJS
    end
    subgraph Paybyrd
        GatewayAPI[Gateway]
        3DSAPI[3DS API]
    end
    subgraph ACS
        Bank
    end

    PaymentAPI --> |1. Create payment*|GatewayAPI
    PaymentAPI --> |2. Redirects customer to 3DS page|3DSPage
    3DSPage[3DS page] --> |3. Executes 3DS flow|ThreeDSecureJS
    ThreeDSecureJS --> |4. Authenticate card| Bank
    Bank --> |5. Notifies authentication status|3DSAPI
    3DSAPI --> |6. Executes payment|GatewayAPI
    GatewayAPI --> |7. Notifies payment status|ClientServer
```

> The Gateway will return an redirect URL in order to execute the 3DS flow.

## Self checkout

Here, the client should integrate their checkout with 3DS JS.

```mermaid

graph
    subgraph ClientServer[Client server]
        PaymentAPI[Payment API]
    end
    subgraph Customer device
        Checkout
        ThreeDSecureJS
    end
    subgraph Paybyrd
        GatewayAPI[Gateway]
        3DSAPI[3DS API]
    end
    subgraph Internet
        Customer
    end
    subgraph ACS
        Bank
    end

    PaymentAPI --> |1. Create payment*|GatewayAPI
    PaymentAPI --> |2. Send self checkout URL|Customer
    Customer --> |3. Access checkout page|Checkout
    Checkout --> |4. Executes 3DS flow|ThreeDSecureJS
    ThreeDSecureJS --> |5. Authenticate card| Bank
    Bank --> |6. Notifies authentication status|3DSAPI
    3DSAPI --> |7. Executes payment|GatewayAPI
    GatewayAPI --> |8. Notifies payment status|ClientServer
```

> The Gateway will return a ThreeDSecure node with an id on it.
> This id should be passed to the 3DS JS to start the process.