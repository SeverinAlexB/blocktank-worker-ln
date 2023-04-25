import { HodlInvoice, HodlInvoiceStatus, IHodlInvoice } from "../database/HodlInvoiceModel";
import { LightningInvoice } from "../1_lnd/LightningInvoice";
import { LndNodes } from "../1_lnd/LndNodes";
import * as ln from 'lightning'


export class HodlInvoiceService {
    constructor(public nodes: LndNodes) {}

    async createInvoice(amountSat: number, description: string): Promise<IHodlInvoice> {
        const node = this.nodes.random
        const lndInvoice = await node.createHodlInvoice(amountSat, description)
        const lnInvoice = new LightningInvoice(lndInvoice.request)
        const doc = await HodlInvoice.create({
            _id: lndInvoice.id,
            request: lndInvoice.request,
            tokens: lndInvoice.tokens,
            secret: lndInvoice.secret,
            createdAt: new Date(lndInvoice.created_at),
            expiresAt: lnInvoice.expiresAt,
            pubkey: node.publicKey,
        })
        return doc
    }

    async cancelInvoice(paymentHash: string) {
        const invoice = await HodlInvoice.findById(paymentHash)
        const node = this.nodes.byPublicKey(invoice.pubkey)
        await node.cancelHodlInvoice(paymentHash)
        return await this.updateState(paymentHash)
    }

    public async subscribeToChanges(paymentHash: string, callback: (invoice: ln.GetInvoiceResult) => any) {
        const invoice = await HodlInvoice.findById(paymentHash)
        const node = this.nodes.byPublicKey(invoice.pubkey)
        node.subscribeToInvoice(paymentHash, async invoice => {
            await callback(invoice)
        })
    }

    public getState(invoice: ln.GetInvoiceResult): HodlInvoiceStatus {
        if (invoice.is_canceled) {
            return HodlInvoiceStatus.CANCELED
        } else if (invoice.is_confirmed) {
            return HodlInvoiceStatus.PAID
        } else if (invoice.is_held) {
            return HodlInvoiceStatus.HOLDING
        } else if (new Date(invoice.expires_at).getTime() > Date.now()) {
            return HodlInvoiceStatus.PENDING
        } else {
            return HodlInvoiceStatus.EXPIRED
        }
    }

    public async getStateById(paymentHash: string): Promise<HodlInvoiceStatus> {
        const invoice = await HodlInvoice.findById(paymentHash)
        const node = this.nodes.byPublicKey(invoice.pubkey)
        const lndInvoice = await node.getInvoice(paymentHash)
        return this.getState(lndInvoice)
    }

    public async updateState(paymentHash: string): Promise<IHodlInvoice> {
        const invoice = await HodlInvoice.findById(paymentHash)
        const state = await this.getStateById(paymentHash)
        invoice.state = state
        await invoice.save()
        return invoice
    }


}