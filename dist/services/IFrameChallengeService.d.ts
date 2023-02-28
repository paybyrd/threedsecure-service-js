import { ILogger } from "../loggers/abstractions";
import { IChallengeExecute, IChallengeOptions, IChallengeService } from "./abstractions";
export declare class IFrameChallengeService implements IChallengeService {
    private static readonly IFRAME_NAME;
    private static readonly FORM_NAME;
    private static readonly CREQ_INPUT_NAME;
    private static readonly CREQ_INPUT_TYPE;
    private readonly _options;
    private readonly _logger;
    constructor(options: IChallengeOptions, logger: ILogger);
    execute(request: IChallengeExecute): Promise<void>;
}
