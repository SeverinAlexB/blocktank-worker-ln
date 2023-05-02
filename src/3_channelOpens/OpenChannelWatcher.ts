import { BlocktankDatabase, RabbitPublisher } from "blocktank-worker2";
import { Config } from "../1_config/Config";
import { LndNodeList } from "../1_lnd/lndNode/LndNodeList";
import { LndNode } from "../1_lnd/lndNode/LndNode";
import { OpenChannelOrder } from "../2_database/entities/OpenChannelOrder.entity";
import { OpenChannelOrderState } from "../2_database/entities/OpenChannelOrderState";
import { ChannelOpenService } from "./openService/ChannelOpenService";


const config = Config.get()


/**
 * Watcher that subscribes to all open hodl invoices, updates our database and publishes events to RabbitMQ.
 */
export class OpenChannelWatcher {
    public nodes: LndNodeList;
    private publisher: RabbitPublisher = new RabbitPublisher(config.workerName)


    async init(nodes: LndNode[]) {
        this.nodes = new LndNodeList(nodes)
        await this.publisher.init()
    }

    async watch(nodes: LndNode[]) {
        await this.init(nodes)
        await this.listenToChannelChanges()
    }

    async stop() {
        await this.publisher.stop()
    }

    async getAllOpenOrPendingOrders() {
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(OpenChannelOrder)
        return await repo.getAllOpenOrPending()
    }

    async pullAllChanges() {
        const orders = await this.getAllOpenOrPendingOrders()
        for (const order of orders) {
            const state = await ChannelOpenService.getChannelState(order)
            await this.onChannelChanged(order.id, state)
        }
    }

    async listenToChannelChanges() {
        for (const node of this.nodes.nodes) {
            node.subscribeToChannels(async (eventName, data) => {
                const txId = data.transaction_id
                const txVout = data.transaction_vout
                const order = await BlocktankDatabase.createEntityManager().getRepository(OpenChannelOrder).getByTx(txId, txVout)
                if (!order) {
                    return
                }
                if (eventName === 'channel_opened') {
                    await this.onChannelChanged(order.id, OpenChannelOrderState.OPEN)
                } else if (eventName === 'channel_closed') {
                    await this.onChannelChanged(order.id, OpenChannelOrderState.CLOSED)
                } else {
                    throw new Error(`Unknown event ${eventName}`)
                }
                
            })
        }
    }

    private async onChannelChanged(orderId: string, newState: OpenChannelOrderState) {
        // Create transaction so the state change is atomic.
        let oldState: OpenChannelOrderState
        await BlocktankDatabase.orm.em.transactional(async (em) => {
            const order = await em.findOneOrFail(OpenChannelOrder, {id: orderId})
            oldState = order.state
            const stateChanged = order.state != newState
            if (!stateChanged) {
                return
            }
            order.state = newState
            em.persist(order)
        })
        const event = {
            orderId: orderId,
            state: {
                old: oldState,
                new: newState
            }
        }
        await this.publisher.publish('channel.update', event)
    }
}