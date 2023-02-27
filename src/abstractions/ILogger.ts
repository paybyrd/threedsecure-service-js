interface ILog extends IError {
}

interface ILogger {
    log(log: ILog): void;
}