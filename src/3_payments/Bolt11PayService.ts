import { BlocktankDatabase } from "blocktank-worker2";
import { Bolt11Payment } from "../2_database/entities/Bolt11Payment.entity";
import { LndNode } from "../1_lnd/lndNode/LndNode";
import { LndNodeManager } from "../1_lnd/lndNode/LndNodeManager";
import { Bolt11PaymentState } from "../2_database/entities/Bolt11PaymentState";
import { interferLndPaymentFailure } from "../1_lnd/lndNode/LndPaymentFailureEnum";
import {sleep} from 'blocktank-worker2/dist/utils'

export class Bolt11PayService {
    static async pay(request: string, node: LndNode, maxFeePpm: number): Promise<Bolt11Payment> {
        const repo = BlocktankDatabase.orm.em.fork().getRepository(Bolt11Payment)
        const pay = await repo.createByNodeAndPersist(request, node)

        try {
            const result = await Promise.race([ // Fire and forget; We will get notified of the result via subscriptions.
            sleep(300),
            node.pay(pay.request, {maxFeePpm: maxFeePpm})
        ])
        } catch (e) {
            // Payment failed very quickly. Why?
           const reason = await this.analyseFailedPayment(pay, node)
        }

        return pay;
    }

    private static async analyseFailedPayment(pay: Bolt11Payment, node: LndNode) {
        try {
            const result = await node.getPayment(pay.paymentHash)
            return 1
        } catch (e) {
            console.log('not found?')
        }
    }

    static async getState(paymentHash: string) {
        const repo = BlocktankDatabase.orm.em.fork().getRepository(Bolt11Payment)
        const pay = await repo.findOneOrFail({paymentHash: paymentHash})
        const node = LndNodeManager.byPublicKey(pay.ourNodePubkey)
        const result = await node.getPayment(pay.paymentHash)
        if (result.is_pending) {
            return {
                state: Bolt11PaymentState.INFLIGHT
            }
        } else if (result.is_failed) {
            return {
                state: Bolt11PaymentState.FAILED,
                error: interferLndPaymentFailure(result.failed)
            }
        } else if (result.is_confirmed) {
            return {
                state: Bolt11PaymentState.PAID,
                secret: result.payment.secret
            }
        } else {
            throw new Error('Undefined payment state', { cause: result})
        }
        
    }

    static interpretFailure(failure: any) {

    }
}