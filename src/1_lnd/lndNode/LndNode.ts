import { ILndConnectionInfo } from "./ILndConnectionInfo";
import * as ln from 'lightning'

type GetChannelResult = ln.GetChannelsResult['channels'][0]

export class LndNode {
    private _rpc: ln.AuthenticatedLnd;
    private latestGetInfo: ln.GetWalletInfoResult;
    constructor(public options: ILndConnectionInfo) { }

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
        const info = await ln.getWalletInfo({ lnd: this.rpc })
        this.latestGetInfo = info
        return info
    }

    /**
     * Creates a hold invoice. LND seems to be canceling hold invoices automatically 10 blocks before it would cause a channel force close.
     * @param amountSat 
     * @param description 
     * @returns 
     */
    async createHodlInvoice(amountSat: number, description: string, expiresInMs: number = 60 * 60 * 1000): Promise<ln.CreateHodlInvoiceResult> {
        const expiredAt = new Date(Date.now() + expiresInMs)
        return await ln.createHodlInvoice({ lnd: this.rpc, tokens: amountSat, description: description, expires_at: expiredAt.toISOString() })
    }

    async cancelHodlInvoice(paymentHash: string) {
        return await ln.cancelHodlInvoice({ lnd: this.rpc, id: paymentHash })
    }

    async settleHodlInvoice(preimage: string) {
        return await ln.settleHodlInvoice({ lnd: this.rpc, secret: preimage })
    }

    async getInvoice(paymentHash: string): Promise<ln.GetInvoiceResult> {
        return await ln.getInvoice({ lnd: this.rpc, id: paymentHash })
    }

    /**
     * All hold invoices, that are currently holding the payment.
     * @returns 
     */
    async getHoldingHodlInvoices(): Promise<ln.GetInvoiceResult[]> {
        const invoices: ln.GetInvoiceResult[] = []
        let paginationToken = undefined
        while (true) {
            const page = await ln.getInvoices({ lnd: this.rpc, is_unconfirmed: true, token: paginationToken })
            const holdInvoices = page.invoices.filter(invoice => invoice.is_held)
            invoices.push(...holdInvoices as any)
            if (page.next === undefined) {
                break
            }
            paginationToken = page.next as any
        }
        return invoices

    }

    /**
     * Subscribes to invoices changes.
     * First event is always the current state of the invoice.
     */
    public subscribeToInvoice(paymentHash: string, callback: (invoice: ln.GetInvoiceResult) => any) {
        ln.subscribeToInvoice({ lnd: this.rpc, id: paymentHash }).on('invoice_updated', async (event: ln.GetInvoiceResult) => {
            await callback(event)
        })
    }

    async getFeeRate(confirmationTarget: number = 6): Promise<ln.GetChainFeeRateResult> {
        return await ln.getChainFeeRate({ lnd: this.rpc, confirmation_target: confirmationTarget })
    }

    /**
     * Add peer to node.
     * @param pubkey Lightning public key
     * @param address Like ip:port or tor:port.
     * @param timeout How long to wait for the peer to connect. Default: 10,000ms.
     */
    async addPeer(pubkey: string, address: string, timeout = 10000): Promise<void> {
        await ln.addPeer({ lnd: this.rpc, socket: address, public_key: pubkey, timeout })
    }

    async openChannel(pubkey: string, isPrivate: boolean, localBalanceSat: number, pushBalanceSat: number = 0): Promise<ln.OpenChannelResult> {
        return await ln.openChannel({
            lnd: this.rpc,
            local_tokens:
                localBalanceSat,
            give_tokens: pushBalanceSat,
            partner_public_key: pubkey,
            is_private: isPrivate,
            min_confirmations: 0
        })
    }

    /**
     * Get all channels
     * @param publicKey Filter channels by node pubkey.
     * @returns 
     */
    async getChannels(publicKey?: string) {
        return await ln.getChannels({
            lnd: this.rpc,
            partner_public_key: publicKey
        })
    }


    /**
     * Get channel by funding transaction id and node pubkey
     * @param txId Funding transaction id
     * @param pubkey Node pubkey
     */
    async getChannel(txId: string, txVout: number, pubkey: string): Promise<ln.GetChannelsResult['channels'][0]> {
        const channels = await this.getChannels(pubkey)
        const result = channels.channels.find(channel => channel.transaction_id === txId && channel.transaction_vout === txVout)
        return result
    }

    /**
     * Subscribes to channel opened and closed events.
     * @param callback 
     */
    async subscribeToChannels(callback: (eventName: 'channel_closed' | 'channel_opened', data: any) => any) {
        const emitter = ln.subscribeToChannels({lnd: this.rpc})
        emitter.on('channel_closed', async (data) => {
            await callback('channel_closed', data)
        })
        emitter.on('channel_opened', async (data) => {
            await callback('channel_opened', data)
        })
    }

}