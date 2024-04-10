import { IAddress } from "./IAddress";
import { ICustomer } from "./ICustomer";
import { IExecuteRequest } from "./IExecuteRequest";

export interface IPreAuthRequest extends IExecuteRequest {
    id: string;
    correlationId: string;
    customer?: ICustomer;
    billingAddress?: IAddress;
    shippingAddress?: IAddress;
}
