interface IChallenge {
    execute(authResponse: IAuthResponse): Promise<void>;
}