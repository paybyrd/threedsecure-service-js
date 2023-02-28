export interface IRequest {
    url: string;
    body?: object;
    method: 'GET' | 'POST';
    headers?: object;
    correlationId: string;
}
