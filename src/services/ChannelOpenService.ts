import { BlocktankDatabase } from "blocktank-worker2"
import { LndNodeManager } from "../1_lnd/lndNode/LndNodeManager"
import * as ln from 'lightning'
import { OpenChannelOrder } from "../2_database/entities/OpenChannelOrder.entity"
import { ChannelOpenError } from "./ChannelOpenError"

export class ChannelOpenService {

    private static splitConnectionString(connectionString: string): {pubkey: string, address: string} {
        const parts = connectionString.split('@')
        if (parts.length !== 2) {
            throw new Error('Invalid connection string')
        }
        if (!parts[0].length) {
            throw new Error('Invalid connection string')
        }
        return {
            pubkey: parts[0],
            address: parts[1]
        }
    }
    static async openChannel(connectionString: string, isPrivate: boolean, localBalanceSat: number, pushBalanceSat: number = 0): Promise<OpenChannelOrder> {
        const {pubkey, address} = this.splitConnectionString(connectionString)
        const node = LndNodeManager.random
        try {
            await node.addPeer(pubkey, address)
        } catch (e) {
            console.log(e)
            throw new ChannelOpenError('Failed to connect to peer.', e[1], e[0])
        }
        let result: ln.OpenChannelResult
        try {
            result = await node.openChannel(pubkey, isPrivate, localBalanceSat, pushBalanceSat)
        } catch (e) {
            console.log(e)
            throw new ChannelOpenError('Failed to open channel.', e[1], e[0])
        }

        const order = new OpenChannelOrder()
        order.publicKey = pubkey
        order.isPrivate = isPrivate
        order.localBalanceSat = localBalanceSat
        order.pushBalanceSat = pushBalanceSat
        order.address = address
        order.txId = result.transaction_id
        order.txVout = result.transaction_vout

        const em = BlocktankDatabase.createEntityManager()
        await em.persistAndFlush(order)
        
        return order
    }
}