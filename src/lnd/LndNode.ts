import { ILndConnectionInfo } from "./ILndConnectionInfo";
import {AuthenticatedLnd, authenticatedLndGrpc, getChainFeeRate, GetChainFeeRateResult, getWalletInfo, GetWalletInfoResult} from 'lightning';

export class LndNode {
    private rpc: AuthenticatedLnd;
    private latestGetInfo: GetWalletInfoResult;
    constructor(public options: ILndConnectionInfo) {}

    get alias(): string {
        return this.latestGetInfo.alias
    }

    get publicKey(): string {
        return this.latestGetInfo.public_key
    }

    get version(): string {
        return this.latestGetInfo.version
    }

    get connectionStrings(): string[] {
        return (this.latestGetInfo as any).uris
    }

    async connect(): Promise<GetWalletInfoResult> {
        const con = authenticatedLndGrpc({
            cert: this.options.tlsCertificate,
            macaroon: this.options.macaroon,
            socket: this.options.grpcSocketUrl
          })
          this.rpc = con.lnd;
          return await this.getInfo()
          
    }

    async getInfo(): Promise<GetWalletInfoResult> {
        const info = await getWalletInfo({lnd: this.rpc})
        this.latestGetInfo = info
        return info
    }
    
    async getFeeRate(confirmationTarget: number = 6): Promise<GetChainFeeRateResult> {
        return await getChainFeeRate({lnd: this.rpc, confirmation_target: confirmationTarget})
    }

    // getInvoice(): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // getOnChainBalance(): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // createInvoice(memo: string, expiry: Date, amount: number): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // createHodlInvoice(memo: string, expiry: Date, amount: number): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // cancelInvoice(id: string): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // settleHodlInvoice(secret: string): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // decodePayReq(payReq: string): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // pay(invoice: string, amount?: number): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // getForwards(): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // getPayment(id: string): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // getSettledPayment(id: string): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // subscribeToInvoices(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
    // subscribeToPaidInvoices(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
    // subscribeToPayments(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
    // subscribeToForwards(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
    // subscribeToChannelRequests(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
    // subscribeToPeers(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
    // subscribeToTopology(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
    // getNetworkGraph(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
    // openChannel(localAmount: number, remoteAmount: number, targetPubKey: string, isPrivate: boolean): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // closeChannel(id: string): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // listChannels(): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // listPeers(): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // listClosedChannels(): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // getChannel(id: string): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // addPeer(url: string): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // listInvoices(): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }
    // listPayments(): Promise<any> {
    //     throw new Error("Method not implemented.");
    // }

}