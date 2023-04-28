import { ILndNodeConfig } from "./ILndNodeConfig";

export interface IConfig {
    workerName: string,
    nodes: ILndNodeConfig[],
}