import { BlocktankDatabase } from "blocktank-worker2"
import * as ln from 'lightning'

import { ChannelOpenError } from "./ChannelOpenError"
import { LndNodeManager } from "../../1_lnd/lndNode/LndNodeManager"
import { OpenChannelOrder } from "../../2_database/entities/OpenChannelOrder.entity"
import { OpenChannelOrderState, interferOpenChannelOrderState } from "../../2_database/entities/OpenChannelOrderState"

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
            throw new ChannelOpenError('Failed to connect to peer.', e[1], e[0])
        }
        let result: ln.OpenChannelResult
        try {
            result = await node.openChannel(pubkey, isPrivate, localBalanceSat, pushBalanceSat)
        } catch (e) {
            throw new ChannelOpenError('Failed to open channel.', e[1], e[0])
        }

        const order = new OpenChannelOrder()
        order.peerPublicKey = pubkey
        order.ourPublicKey = node.publicKey
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

    static async getChannelState(order: OpenChannelOrder): Promise<OpenChannelOrderState> {
        const node = LndNodeManager.byPublicKey(order.ourPublicKey)
        const channel = await node.getChannel(order.txId, order.txVout, order.peerPublicKey)
        return interferOpenChannelOrderState(channel)
    }

    static async getChannelOrder(id: string) {
        const em = BlocktankDatabase.createEntityManager()
        return await em.findOne(OpenChannelOrder, {
            id: id
        })
    }
}