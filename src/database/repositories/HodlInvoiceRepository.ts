import { EntityRepository } from '@mikro-orm/mongodb'; // or any other driver package
import { HodlInvoice } from '../entities/HodlInvoice.entity';
import { LndNode } from '../../1_lnd/LndNode';
import { LightningInvoice } from '../../1_lnd/LightningInvoice';
import { HodlInvoiceState } from '../../1_lnd/hodl/HodlInvoiceState';
import { LndHodlInvoiceService } from '../../1_lnd/hodl/LndHodlInvoiceService';

export class HodlInvoiceRepository extends EntityRepository<HodlInvoice> {
    async createByNodeAndPersist(amountSat: number, description: string, node: LndNode) {
        const lndInvoice = await node.createHodlInvoice(amountSat, description)
        const lnInvoice = new LightningInvoice(lndInvoice.request)
        const invoice = new HodlInvoice()
        invoice.id = lndInvoice.id
        invoice.request = lndInvoice.request
        invoice.tokens = lndInvoice.tokens
        invoice.secret = lndInvoice.secret
        invoice.createdAt = new Date(lndInvoice.created_at)
        invoice.expiresAt = lnInvoice.expiresAt
        invoice.pubkey = node.publicKey
        this.em.persist(invoice)
        return invoice
    }

    async cancelAndPersist(invoice: HodlInvoice, node: LndNode) {
        await node.cancelHodlInvoice(invoice.id)
        invoice.state = HodlInvoiceState.CANCELED
        this.em.persist(invoice)
    }
}