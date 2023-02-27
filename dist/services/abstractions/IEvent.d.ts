import { IError } from "../../shared/abstractions/IError";
export type EventType = 'event:create:start' | 'event:preAuth:start' | 'event:auth:start' | 'event:postAuth:start' | 'event:dsMethod:start' | 'event:challenge:v1:start' | 'event:challenge:v2:start' | 'event:delay:start' | 'event:create:success' | 'event:preAuth:success' | 'event:auth:success' | 'event:postAuth:success' | 'event:dsMethod:success' | 'event:challenge:v1:success' | 'event:challenge:v2:success' | 'event:delay:success' | 'event:create:fail' | 'event:preAuth:fail' | 'event:auth:fail' | 'event:postAuth:fail' | 'event:dsMethod:fail' | 'event:challenge:v1:fail' | 'event:challenge:v2:fail' | 'event:delay:fail' | 'event:create:error' | 'event:preAuth:error' | 'event:auth:error' | 'event:postAuth:error' | 'event:dsMethod:error' | 'event:challenge:v1:error' | 'event:challenge:v2:error' | 'event:delay:error' | 'event:error';
export interface IEvent {
    type: EventType;
    data: object;
    error: IError;
}
