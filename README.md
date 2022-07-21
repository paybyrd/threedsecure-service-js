# ThreeDSecure Service

A library to simplify the implementation of 3DS flow using Paybyrd API.

## How to install

```npm i @paybyrd/threedsecure-service```

## How to configure ThreeDSecureService

### Parameters

* **container:** HTML Element where the iframe needed to execute the challenge will be created. The iframe will be resizable as the container. **DEFAULT: document.body**
* **threeDSecureUrl:** Paybyrd ThreeDSecure API base URL.**DEFAULT: https://threedsecure.paybyrd.com**
* **maxAttempts:** The max attempts when the API returns transient errors, like 409, 404 or 504 status codes.**DEFAULT: 50**
* **attemptDelay:** The amount of time in milliseconds to wait for the next attempt when some transient error happens.**DEFAULT: 2000**
* **culture**: The culture that should be used for API responses.**DEFAULT: en-US**
* **onProgressFn:** A notification function to identify what is happening inside the service.**DEFAULT: NULL**


```js
const container = document.getElementById('container-3ds');
const threeDSecureUrl = 'https://threedsecure.paybyrd.com';
const maxAttempts = 50;
const attemptDelay = 2000;
const culture = 'en-US';
const onProgressFn = ({
    type,
    error
}) => console.log(`${type}:${error}`);

const threeDSService = new ThreeDSecureService({
    container,
    threeDSecureUrl,
    maxAttempts,
    attemptDelay,
    culture,
    onProgressFn
});
```

## How to send the request

### Parameters
* **cardNumber:** The card number.
* **cardHolder:** The card holder.
* **cardExpiration:** The card expiration following the pattern **MM/YY**.
* **merchantId:** The merchant id registered to the API.
* **purchaseAmount:** The purchase amount in cents.
* **purchaseCurrency:** The purchase currency folowwing the **ISO 4217 format**.

```js
const request = {
    cardNumber: '5500000000000001',
    cardHolder: 'PAYBYRD CARD HOLDER',
    cardExpiration: '07/30',
    merchantId: 10,
    purchaseAmount: 1,
    purchaseCurrency: 'EUR'
}

const threeDSResponse = await threeDSecureService.createAndExecute(request);
```

### How to identify errors

```js
try {
    const threeDSResponse = await threeDSecureService.createAndExecute(request);
} catch (error) {
    // Show the error.message in your website
}
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
        cvv: '123',
        threeDSVersion: threeDSResponse.version,
        aav: threeDSResponse.authenticationValue,
        caav_algorithm: threeDSResponse.authenticationValueAlgorithm,
        dsTransactionId: threeDSResponse.dsTransactionId,
        eci: threeDSResponse.eci,
        xid: threeDSResponse.xid,
        verificationMethod: threeDSResponse.verificationMethod
    }
};

const createPaymentResponse = await axios.post(
    `https://gateway.paybyrd.com/api/v2/payment?checkoutKey=${checkoutKey}`,
    createPaymentRequest);
```
