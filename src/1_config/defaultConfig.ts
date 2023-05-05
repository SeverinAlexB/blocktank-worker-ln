import BitcoinNetworkEnum from "../1_lnd/BitcoinNetworkEnum";
import { IConfig } from "./IConfig";

export const defaultConfig: IConfig = {
    workerName: 'svc:ln2',
    workerPort: 10039,
    grapeUrl: 'http://127.0.0.1:30001',
    nodes: [],
    alertOnchainBalanceThresholdSat: 0,
    bitcoinNetwork: BitcoinNetworkEnum.REGTEST
}