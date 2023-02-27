interface IBrowser {
    javaEnabled: boolean;
    javascriptEnabled: boolean;
    language: string;
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    timezoneOffset: number;
    colorDepth: number;
    acceptHeader: string;
}