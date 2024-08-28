export interface IPostAuthResponse {
    callbackUrl: string,
    transactionId: string,
    status: "Authorized" | "Unauthorized" | "Expired" | "NotEnrolled",
    paymentStatus?: "Success" | "Denied" | "Error",
    authenticationData: {
        threeDsVersion: "V2",
        aav?: string,
        dsTransactionId?: string,
        eci?: string,
        verificationMethod: "None"|"ThreeDSecure",
        protocolVersion?: string
    },
    code?: string,
    message?: string,
    details?: string,
    executePayment: boolean,
    authorizationTransStatus?: "A" | "R" | "U" | "C" | "N",
    authorizationTransStatusReason?: string,
    transStatus: "Y" | "N",
    transStatusReason: string
}
