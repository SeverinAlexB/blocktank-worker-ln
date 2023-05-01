import {BlocktankDatabase, WorkerImplementation} from 'blocktank-worker2'
import { HodlInvoice } from '../2_database/entities/HodlInvoice.entity';
import { LndNodeManager } from '../1_lnd/lndNode/LndNodeManager';
import { ChannelOpenService } from '../services/ChannelOpenService';
import { OpenChannelOrder } from '../2_database/entities/OpenChannelOrder.entity';

export class LightningWorkerImplementation extends WorkerImplementation {

    /**
     * Creates a hodl invoice and returns it.
     * @param amountSat Number of satoshi
     * @param description Invoice description
     * @param expiresInMs Invoice expiry time in milliseconds. Default 1hr
     * @returns 
     */
    async createHodlInvoice(amountSat: number, description: string, expiresInMs: number = 60*60*1000): Promise<HodlInvoice> {
        const repo = BlocktankDatabase.orm.em.fork().getRepository(HodlInvoice)
        // const repo = BlocktankDatabase.createEntityManager().getRepository(HodlInvoice)
        const node = LndNodeManager.random
        const invoice = await repo.createByNodeAndPersist(amountSat, description, node, expiresInMs)
        return invoice
    }

    /**
     * Cancels hodl invoice and refunds client if payment was on hold.
     * @param paymentHash 
     * @returns 
     */
    async cancelHodlInvoice(paymentHash: string) {

        const repo = BlocktankDatabase.createEntityManager().getRepository(HodlInvoice)
        const invoice = await repo.findOne({'paymentHash': paymentHash})
        if (!invoice) {
            throw new Error('Invoice not found')
        }
        const node = LndNodeManager.byPublicKey(invoice.pubkey)
        await node.cancelHodlInvoice(invoice.paymentHash)
        return true
    }

    /**
     * Settles the hold payment.
     * @param paymentHash 
     * @returns 
     */
    async settleHodlInvoice(paymentHash: string) {
        const repo = BlocktankDatabase.createEntityManager().getRepository(HodlInvoice)
        const invoice = await repo.findOne({paymentHash: paymentHash})
        if (!invoice) {
            throw new Error('Invoice not found')
        }
        const node = LndNodeManager.byPublicKey(invoice.pubkey)
        node.settleHodlInvoice(invoice.secret)
        return true
    }

    /**
     * Get the current state of the invoice.
     * @param paymentHash 
     * @returns 
     */
    async getHodlInvoice(paymentHash: string): Promise<HodlInvoice> {
        const repo = BlocktankDatabase.createEntityManager().getRepository(HodlInvoice)
        const invoice = await repo.findOne({paymentHash: paymentHash})
        if (!invoice) {
            throw new Error('Invoice not found')
        }
        return invoice
    }

    /**
     * Opens a channel to the specified node.
     * @param connectionString pubkey@ip:port or pubkey@tor:port
     * @param isPrivate True if the channel should be private.
     * @param localBalanceSat Number of satoshi to commit to the channel.
     * @param pushBalanceSat Number of satoshi to push to the node.
     * @returns 
     */
    async openChannel(connectionString: string, isPrivate: boolean, localBalanceSat: number, pushBalanceSat: number = 0): Promise<OpenChannelOrder> {
        return await ChannelOpenService.openChannel(connectionString, isPrivate, localBalanceSat, pushBalanceSat)
    }

}