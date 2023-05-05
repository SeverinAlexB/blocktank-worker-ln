import BitcoinNetworkEnum from "../1_lnd/BitcoinNetworkEnum";
import { ILndNodeConfig } from "./ILndNodeConfig";

export interface IConfig {
    workerName: string,
    workerPort: number,
    grapeUrl: string,
    nodes: ILndNodeConfig[],
    alertOnchainBalanceThresholdSat: number,
    bitcoinNetwork: BitcoinNetworkEnum
}