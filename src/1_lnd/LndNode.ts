import { ILndConnectionInfo } from "./ILndConnectionInfo";
import * as ln from 'lightning'

export class LndNode {
    private _rpc: ln.AuthenticatedLnd;
    private latestGetInfo: ln.GetWalletInfoResult;
    constructor(public options: ILndConnectionInfo) {}

    private get rpc(): ln.AuthenticatedLnd {
        if (!this._rpc) {
            throw new Error('RPC not initialized. Call connect() first.')
        }
        return this._rpc
    }

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

    async connect() {
        const con = ln.authenticatedLndGrpc({
            cert: this.options.tlsCertificate,
            macaroon: this.options.macaroon,
            socket: this.options.grpcSocketUrl
          })
          this._rpc = con.lnd;
        await this.getInfo()
    }

    async getInfo(): Promise<ln.GetWalletInfoResult> {
        const info = await ln.getWalletInfo({lnd: this.rpc})
        this.latestGetInfo = info
        return info
    }

    async createHodlInvoice(amountSat: number, description: string): Promise<ln.CreateHodlInvoiceResult> {
        return await ln.createHodlInvoice({lnd: this.rpc, tokens: amountSat, description: description})
    }

    async cancelHodlInvoice(paymentHash: string) {
        return await ln.cancelHodlInvoice({lnd: this.rpc, id: paymentHash})
    }
    
    async settleHodlInvoice(preimage: string) {
        return await ln.settleHodlInvoice({lnd: this.rpc, secret: preimage})
    }

    async getInvoice(paymentHash: string): Promise<ln.GetInvoiceResult> {
        return await ln.getInvoice({lnd: this.rpc, id: paymentHash})
    }

    /**
     * Subscribes to invoices changes.
     */
    public subscribeToInvoice(paymentHash: string, callback: (invoice: ln.GetInvoiceResult) => any) {
        ln.subscribeToInvoice({lnd: this.rpc, id: paymentHash}).on('invoice_updated', async (event: ln.GetInvoiceResult) => {
            await callback(event)
        })
    }

    async getFeeRate(confirmationTarget: number = 6): Promise<ln.GetChainFeeRateResult> {
        return await ln.getChainFeeRate({lnd: this.rpc, confirmation_target: confirmationTarget})
    }



}