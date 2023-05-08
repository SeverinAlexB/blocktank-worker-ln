import { BlocktankDatabase, RabbitPublisher } from "blocktank-worker2";
import { AppConfig } from "../1_config/Config";
import { LndNodeList } from "../1_lnd/lndNode/LndNodeList";
import { LndNode } from "../1_lnd/lndNode/LndNode";
import { Bolt11Payment } from "../2_database/entities/Bolt11Payment.entity";
import { Bolt11PayService } from "./Bolt11PayService";
import { Bolt11PaymentState } from "../2_database/entities/Bolt11PaymentState";
import { Bolt11PayChangedEvent } from "./Bolt11PayChangedEvent";



const config = AppConfig.get()


/**
 * Watcher that subscribes to all open hodl invoices, updates our database and publishes events to RabbitMQ.
 */
export class Bolt11PayWatcher {
    public nodes: LndNodeList;
    private publisher: RabbitPublisher = new RabbitPublisher(config.workerName)


    async _init(nodes: LndNode[]) {
        this.nodes = new LndNodeList(nodes)
        await this.publisher.init()
    }

    async watch(nodes: LndNode[]) {
        await this._init(nodes)
        await this.listenToPaymentChanges()
        await this.pullAllChanges()
    }

    async stop() {
        await this.publisher.stop()
    }

    async getAllInflightPayments() {
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(Bolt11Payment)
        return await repo.getAllOpen()
    }

    /**
     * Sync all payments in our db with the node in case we missed an update.
     */
    async pullAllChanges() {
        const payments = await this.getAllInflightPayments()
        for (const payment of payments) {
            const state = await Bolt11PayService.getState(payment.paymentHash)
            if (state.state !== payment.state) {
                await this.onPaymentChanged(payment.paymentHash, state.state, state.error, state.secret)
            }
        }
    }

    /**
     * Listen to any payment changes on the node.
     */
    async listenToPaymentChanges() {
        for (const node of this.nodes.nodes) {
            node.subscribetoPayments(async (paymentHash, newState, error?, secret?) => {
                // console.log('Pay event', paymentHash, newState, error)
                const repo = BlocktankDatabase.createEntityManager().getRepository(Bolt11Payment)
                const payment = await repo.findOne({paymentHash: paymentHash})
                if (!payment) {
                    console.log(`No payment with hash ${paymentHash} is associated with a invoice in our database.`)
                    return
                }
                if (payment.state !== newState) {
                    await this.onPaymentChanged(paymentHash, newState, error, secret)
                }

            })
        }
    }

    private async onPaymentChanged(paymentHash: string, newState: Bolt11PaymentState, error?: string, secret?: string) {
        // Create transaction so the state change is atomic.
        const em = BlocktankDatabase.createEntityManager()

        const payment = await em.findOneOrFail(Bolt11Payment, { paymentHash: paymentHash })
        const oldState = payment.state
        const stateChanged = payment.state != newState
        if (!stateChanged) {
            return
        }
        console.log(`${paymentHash} new state: ${payment.state} to ${newState}. Error: ${error}, secret: ${secret}`)
        payment.state = newState
        payment.error = error
        payment.secret = secret
        em.persist(payment)
        await em.flush()
        const event: Bolt11PayChangedEvent = {
            paymentHash: paymentHash,
            state: {
                old: oldState,
                new: newState
            },
            updatedAt: new Date()
        }
        await this.publisher.publish('paymentChanged', event)
    }
}