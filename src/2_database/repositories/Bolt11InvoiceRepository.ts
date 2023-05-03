import { EntityRepository } from '@mikro-orm/mongodb'; // or any other driver package
import { Bolt11Invoice } from '../entities/Bolt11Invoice.entity';
import { LightningInvoice } from '../../1_lnd/LightningInvoice';
import { Bolt11InvoiceState } from '../entities/Bolt11InvoiceState';
import { LndNode } from '../../1_lnd/lndNode/LndNode';

interface ICreateByNodeAndPersistOptions {
    expiresInMs?: number,
    isHodlInvoice: boolean
}

const defaultCreateByNodeAndPersistOptions: ICreateByNodeAndPersistOptions = {
    expiresInMs: 60*60*1000,
    isHodlInvoice: false
}

export class Bolt11InvoiceRepository extends EntityRepository<Bolt11Invoice> {
    async createByNodeAndPersist(amountSat: number, description: string, node: LndNode, options: Partial<ICreateByNodeAndPersistOptions> = {}) {
        const opts: ICreateByNodeAndPersistOptions = { ...defaultCreateByNodeAndPersistOptions, ...options }
        const lndInvoice = await node.createHodlInvoice(amountSat, description, opts.expiresInMs)
        const lnInvoice = new LightningInvoice(lndInvoice.request)
        const invoice = new Bolt11Invoice()
        invoice.isHodlInvoice = opts.isHodlInvoice
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

    async getAllOpen() {
        return this.find({ state: { $in: [Bolt11InvoiceState.HOLDING, Bolt11InvoiceState.PENDING] } })
    }
}