import { EntityRepository } from '@mikro-orm/mongodb'; // or any other driver package
import { HodlInvoice } from '../entities/HodlInvoice.entity';
import { LightningInvoice } from '../../1_lnd/LightningInvoice';
import { HodlInvoiceState } from '../entities/HodlInvoiceState';
import { LndNode } from '../../1_lnd/lndNode/LndNode';


export class HodlInvoiceRepository extends EntityRepository<HodlInvoice> {
    async createByNodeAndPersist(amountSat: number, description: string, node: LndNode, expiresInMs: number = 60*60*1000) {
        const lndInvoice = await node.createHodlInvoice(amountSat, description, expiresInMs)
        const lnInvoice = new LightningInvoice(lndInvoice.request)
        const invoice = new HodlInvoice()
        invoice.paymentHash = lndInvoice.id
        invoice.request = lndInvoice.request
        invoice.tokens = lndInvoice.tokens
        invoice.secret = lndInvoice.secret
        invoice.createdAt = new Date(lndInvoice.created_at)
        invoice.updatedAt = new Date(lndInvoice.created_at)
        invoice.expiresAt = lnInvoice.expiresAt
        invoice.pubkey = node.publicKey
        await this.em.persistAndFlush(invoice)
        return invoice
    }

    async cancelAndPersist(invoice: HodlInvoice, node: LndNode) {
        await node.cancelHodlInvoice(invoice.paymentHash)
        await this.em.persistAndFlush(invoice)
    }

    async settleAndPersist(invoice: HodlInvoice, node: LndNode) {
        await node.settleHodlInvoice(invoice.secret)
        invoice.state = HodlInvoiceState.PAID
        await this.em.persistAndFlush(invoice)
    }

    async getAllOpen() {
        return this.find({ state: { $in: [HodlInvoiceState.HOLDING, HodlInvoiceState.PENDING] } })
    }
}