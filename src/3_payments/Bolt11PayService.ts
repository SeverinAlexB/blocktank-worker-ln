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
            await Promise.race([ // Fire and forget; We will get notified of the result via subscriptions.
            sleep(300),
            node.pay(pay.request, {maxFeePpm: maxFeePpm})
        ])
        } catch (e) {
            /**
             * Payment failed very quickly. Why? 
             * There are 2 types of errors here:
             * Payment succeded/failed -> No problem, we will be notified via our subscriptions.
             * Payment didn't get accepted by LND -> Problem, subscriptions don't work. Need to log issue. We should prevalidate this issue
             * as much as possible so we don't run into it.
             */

           if (!(await this.didPaymentRegisterOnLnd(pay, node))) {
                console.error(`Could not find payment with hash ${pay.paymentHash} in db after calling node.pay. ${request}. ${e}`)
           }
        }

        return pay;
    }

    private static async didPaymentRegisterOnLnd(pay: Bolt11Payment, node: LndNode) {
        try {
            await node.getPayment(pay.paymentHash)
            return true
        } catch (e) {
            return false
        }
    }

    static async getPayment(paymentHash: string): Promise<Bolt11Payment> {
        const repo = BlocktankDatabase.createEntityManager().getRepository(Bolt11Payment)
        return await repo.findOne({
            paymentHash: paymentHash
        })
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
}