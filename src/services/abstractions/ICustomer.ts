export interface ICustomer {
    email: string;
    homePhone?: IPhone;
    mobilePhone?: IPhone;
    workPhone?: IPhone;
}

export interface IPhone {
    countryCode: string;
    number: string;
}