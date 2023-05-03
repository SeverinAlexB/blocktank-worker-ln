import { ILndNodeConfig } from "./ILndNodeConfig";

export interface IConfig {
    workerName: string,
    workerPort: number,
    grapeUrl: string,
    nodes: ILndNodeConfig[],
    alertOnchainBalanceThresholdSat: number
}