interface IDirectoryServer {
    execute(preAuthResponse: IPreAuthResponse) : Promise<void>;
}