import { BlocktankDatabase, RabbitPublisher } from "blocktank-worker2";
import { HodlInvoice } from "../2_database/entities/HodlInvoice.entity";
import * as ln from 'lightning'
import { Config } from "../1_config/Config";
import { interferInvoiceChangedAt, interferInvoiceState } from "../2_database/entities/HodlInvoiceState";
import { LndNodeList } from "../1_lnd/lndNode/LndNodeList";
import { LndNode } from "../1_lnd/lndNode/LndNode";
import { toInvoiceStateChangedEvent } from "./IInvoiceStateChangedEvent";

const config = Config.get()


/**
 * Watcher that subscribes to all open hodl invoices, updates our database and publishes events to RabbitMQ.
 */
export class HodlInvoiceWatcher {
    public nodes: LndNodeList;
    private listenAlready: Map<string, boolean> = new Map()
    private publisher: RabbitPublisher = new RabbitPublisher(config.workerName)
    private interval: NodeJS.Timer

    async init(nodes: LndNode[]) {
        this.nodes = new LndNodeList(nodes)
        await this.publisher.init()
    }

    async watch(nodes: LndNode[]) {
        await this.init(nodes)
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
            await this.listenToInvoice(invoice)
        }
    }

    async listenToInvoice(invoice: HodlInvoice) {
        const doWeListenAlready = this.listenAlready.get(invoice.paymentHash)
        if (doWeListenAlready) {
            return
        }

        const node = this.nodes.byPublicKey(invoice.pubkey)
        node.subscribeToInvoice(invoice.paymentHash, async lndInvoice => {
            await this.onInvoiceEvent(lndInvoice)
        })
        console.log('Subscribed to invoice', invoice.paymentHash, invoice.state)
        this.listenAlready.set(invoice.paymentHash, true)
    }

    private async onInvoiceEvent(lndInvoice: ln.GetInvoiceResult) {
        const repo = BlocktankDatabase.createEntityManager().getRepository(HodlInvoice)
        const invoice = await repo.findOne({paymentHash: lndInvoice.id})
        const oldState = invoice.state
        const newState = interferInvoiceState(lndInvoice)
        console.log(`paymentHash ${invoice.paymentHash} - ${oldState} to ${newState}`)
        const stateChanged = newState !== invoice.state
        if (stateChanged) {
            // State changed
            invoice.updatedAt = interferInvoiceChangedAt(lndInvoice)
            invoice.state = newState
            await BlocktankDatabase.createEntityManager().persistAndFlush(invoice)
            const event = toInvoiceStateChangedEvent(invoice, oldState, newState)
            await this.publisher.publish('invoice.changed', event)
        }
    }



}