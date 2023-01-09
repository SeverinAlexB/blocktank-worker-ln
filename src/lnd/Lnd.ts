import { ILightningNode } from "../ILightningNode";
import { ILndConfig } from "./LndConfig";
import {AuthenticatedLnd, authenticatedLndGrpc, getChainFeeRate, GetChainFeeRateResult, getWalletInfo, GetWalletInfoResult} from 'lightning';

export class Lnd implements ILightningNode {
    private rpc: AuthenticatedLnd;
    constructor(public config: ILndConfig) {

    }
    async init(): Promise<void> {
        const { lnd } = authenticatedLndGrpc({
            cert: this.config.tlsCertificate,
            macaroon: this.config.macaroon,
            socket: this.config.grpcSocketUrl
          })
          this.rpc = lnd;
          
    }
    async getInfo(): Promise<GetWalletInfoResult> {
        const info = await getWalletInfo({lnd: this.rpc})
        return info
    }
    
    getInvoice(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    async getFeeRate(confirmationTarget: number = 6): Promise<GetChainFeeRateResult> {
        return await getChainFeeRate({lnd: this.rpc, confirmation_target: confirmationTarget})
    }
    getOnChainBalance(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createInvoice(memo: string, expiry: Date, amount: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createHodlInvoice(memo: string, expiry: Date, amount: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    cancelInvoice(id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    settleHodlInvoice(secret: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    decodePayReq(payReq: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    pay(invoice: string, amount?: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getForwards(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getPayment(id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getSettledPayment(id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    subscribeToInvoices(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribeToPaidInvoices(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribeToPayments(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribeToForwards(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribeToChannelRequests(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribeToPeers(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribeToTopology(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getNetworkGraph(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    openChannel(localAmount: number, remoteAmount: number, targetPubKey: string, isPrivate: boolean): Promise<any> {
        throw new Error("Method not implemented.");
    }
    closeChannel(id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    listChannels(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    listPeers(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    listClosedChannels(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getChannel(id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    addPeer(url: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    listInvoices(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    listPayments(): Promise<any> {
        throw new Error("Method not implemented.");
    }

}