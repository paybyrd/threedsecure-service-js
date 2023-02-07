type Status = "start" | "success" | "fail" | "error";

export type RetryEvents = "create" | "preAuth" | "auth" | "postAuth";

type ProgressEventType = `event:${
  | "error"
  | `${RetryEvents}:${Status}`
  | `${`challenge:v${1 | 2}` | `dsMethod`}:${Exclude<Status, "error">}`
  | `delay:${"start" | "end"}`}`;

type ProgressEvent = {
  type: ProgressEventType;
  error?: any;
  data?: any;
};

export type Response<T> = {
  isSuccess: boolean;
  status: number;
  data: { data: T; error?: any };
};

export type ThreeDSecureServiceOptions = {
  /**
   * @default "https://threedsecure.paybyrd.com"
   */
  threeDSecureUrl?: string;
  /**
   * @default document.body
   */
  container?: HTMLElement;
  /**
   * @default 50
   */
  maxAttempts?: number;
  /**
   * @default 2000
   */
  attemptDelay?: number;
  /**
   * @default "en-US"
   */
  culture?: string;
  onProgressFn?(event: ProgressEvent): void;
  onIFrameCreatedFn?(iframe: HTMLIFrameElement): void;
  onContainerCreatedFn?(container: HTMLElement): void;
};

export type CreateAndExecuteRequest = (
  | {
      cardNumber: string;
      cardHolder: string;
      cardExpiration: string;
    }
  | { tokenId: string }
) & {
  merchantId: number;
  purchaseAmount: number;
  purchaseCurrency: string;
  challengeOptions:
    | "NoPreference"
    | "NoChallenge"
    | "ThreeDSecurePreference"
    | "Required";
};

export type CreateResponse = { id: string };

export type PreAuthResponse = {
  dsMethodUrl: string;
  processId: string;
  notificationUrl: string;
  isDsMethodRequired: boolean;
};

export type AuthResponse = {
  isChallengeRequired: boolean;
  challengeVersion: string;
  challengeUrl: string;
  preAuthRequest: string;
  notificationUrl: string;
  processId: string;
  challengeId: string;
};

export type PostAuthV2Response = {
  callbackUrl: string;
  transactionId: string | null;
  status: "Authorized" | "Unauthorized";
  paymentStatus: string | null;
  authenticationData: {
    threeDsVersion: string;
    aav: string | null;
    dsTransactionId: string | null;
    eci: string | null;
    verificationMethod: string;
  };
  code: string | null;
  message: string | null;
  details: string | null;
  executePayment: boolean;
  transStatus: string;
  transStatusReason: string | null;
};

export type PostAuthV1Response = { transactionId: string } & (
  | {
      status: "Authorized";
      authenticationData: {
        threeDsVersion: string;
        aav: string;
        dsTransactionId: string;
        eci: string;
        verificationMethod: string;
      };
    }
  | {
      status: "NotEnrolled";
      code: string;
      message: string;
      details: string;
    }
);
