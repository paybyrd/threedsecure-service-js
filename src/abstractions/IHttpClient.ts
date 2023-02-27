interface IRequest {
    url: string;
    timeoutInSeconds: number;
    body?: object;
    method: 'GET' | 'POST';
    headers?: object;
}

interface IHttpClient {
    send<T>(request: IRequest): Promise<T>;
}