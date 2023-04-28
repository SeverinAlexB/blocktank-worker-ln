import { BlocktankDatabase, RabbitPublisher } from "blocktank-worker2";
import { HodlInvoice } from "../2_database/entities/HodlInvoice.entity";
import * as ln from 'lightning'
import { Config } from "../1_config/Config";
import { interferInvoiceChangedAt, interferInvoiceState } from "../2_database/entities/HodlInvoiceState";
import { LndNodeList } from "../1_lnd/lndNode/LndNodeList";
import { LndNode } from "../1_lnd/lndNode/LndNode";
import { IInvoiceStateChangedEvent } from "./InvoiceStateChangedEvent";

const config = Config.get()


/**
 * Watcher that subscribes to all open hodl invoices, updates our database and publishes events to RabbitMQ.
 */
export class HodlInvoiceWatcher {
    public nodes: LndNodeList;
    private listenAlready: Map<string, boolean> = new Map()
    private publisher: RabbitPublisher = new RabbitPublisher(config.workerName)
    private interval: NodeJS.Timer

    async watch(nodes: LndNode[]) {
        this.nodes = new LndNodeList(nodes)
        await this.publisher.init()
        await this.subscribeToChanges()
        this.interval = setInterval(async () => {
            await this.subscribeToChanges()
        }, 10*1000)
    }

    async stop() {
        clearInterval(this.interval)
        await this.publisher.stop()
    }

    async subscribeToChanges() {
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(HodlInvoice)
        const invoices = await repo.getAllOpen()
        for (const invoice of invoices) {
            const doWeListenAlready = this.listenAlready.get(invoice.paymentHash)
            if (doWeListenAlready) {
                continue
            }

            const node = this.nodes.byPublicKey(invoice.pubkey)
            node.subscribeToInvoice(invoice.paymentHash, async lndInvoice => {
                await this.onInvoiceEvent(invoice, lndInvoice)
            })
            console.log('Subscribed to invoice', invoice.paymentHash, invoice.state)
            this.listenAlready.set(invoice.paymentHash, true)
        }
    }

    private async onInvoiceEvent(invoice: HodlInvoice, lndInvoice: ln.GetInvoiceResult) {
        const oldState = invoice.state
        const newState = interferInvoiceState(lndInvoice)
        console.log(`paymentHash ${invoice.paymentHash} ${oldState} to ${newState}`)
        const stateChanged = newState !== invoice.state
        if (stateChanged) {
            // State changed
            invoice.state = newState
            await BlocktankDatabase.createEntityManager().persistAndFlush(invoice)
            const changedAt = interferInvoiceChangedAt(lndInvoice)
            const event: IInvoiceStateChangedEvent = {
                paymentHash: invoice.paymentHash,
                state: {
                    old: oldState,
                    new: newState
                },
                changedAt: changedAt
            }
            await this.publisher.publish('invoice.changed', event)
        }
    }



}