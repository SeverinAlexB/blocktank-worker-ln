import { EntityRepository } from '@mikro-orm/mongodb'; // or any other driver package
import { Bolt11Invoice } from '../entities/Bolt11Invoice.entity';
import { LightningInvoice } from '../../1_lnd/LightningInvoice';
import { LndNode } from '../../1_lnd/lndNode/LndNode';
import { Bolt11Payment } from '../entities/Bolt11Payment.entity';
import { Bolt11PaymentState } from '../entities/Bolt11PaymentState';
import isValidLightningInvoice from '../../1_lnd/isValidLightningInvoice';



export class Bolt11PaymentRepository extends EntityRepository<Bolt11Payment> {
    async createByNodeAndPersist(request: string, node: LndNode) {
        const check = isValidLightningInvoice(request)
        if (!check.isValid) {
            throw new Error(`Invalid lightning invoice: ${check.error}`)
        }
        const lnInvoice = new LightningInvoice(request)
        const pay = new Bolt11Payment()
        pay.paymentHash = lnInvoice.paymentHash
        pay.request = request
        pay.satoshi = lnInvoice.satoshi
        pay.milliSatoshi = lnInvoice.milliSatoshi
        pay.ourNodePubkey = node.publicKey
        await this.em.persistAndFlush(pay)
        return pay
    }

    async getAllOpen() {
        return this.find({ state: { $in: [Bolt11PaymentState.INFLIGHT] } })
    }
}