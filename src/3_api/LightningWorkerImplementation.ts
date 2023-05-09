import { BlocktankDatabase, WorkerImplementation } from 'blocktank-worker2'
import { Bolt11Invoice } from '../2_database/entities/Bolt11Invoice.entity';
import { LndNodeManager } from '../1_lnd/lndNode/LndNodeManager';
import { OpenChannelOrder } from '../2_database/entities/OpenChannelOrder.entity';
import { ChannelOpenService } from '../3_channelOpens/openService/ChannelOpenService';
import { Bolt11Payment } from '../2_database/entities/Bolt11Payment.entity';
import { Bolt11PayService } from '../3_payments/Bolt11PayService';

export class LightningWorkerImplementation extends WorkerImplementation {

    /**
     * Creates a hodl invoice and returns it.
     * @param amountSat Number of satoshi
     * @param description Invoice description
     * @param expiresInMs Invoice expiry time in milliseconds. Default 1hr
     * @returns 
     */
    async createHodlInvoice(amountSat: number, description: string, expiresInMs: number = 60 * 60 * 1000): Promise<Bolt11Invoice> {
        const repo = BlocktankDatabase.orm.em.fork().getRepository(Bolt11Invoice)
        const node = LndNodeManager.random
        const invoice = await repo.createByNodeAndPersist(amountSat, description, node, {
            isHodlInvoice: true,
            expiresInMs: expiresInMs
        })
        return invoice
    }

    /**
     * Cancels hodl invoice and refunds client if payment was on hold.
     * @param paymentHash 
     * @returns 
     */
    async cancelHodlInvoice(paymentHash: string): Promise<void> {

        const repo = BlocktankDatabase.createEntityManager().getRepository(Bolt11Invoice)
        const invoice = await repo.findOne({ 'paymentHash': paymentHash, isHodlInvoice: true })
        if (!invoice) {
            throw new Error('Invoice not found')
        }
        const node = LndNodeManager.byPublicKey(invoice.pubkey)
        await node.cancelHodlInvoice(invoice.paymentHash)
    }

    /**
     * Settles the hold payment.
     * @param paymentHash 
     * @returns 
     */
    async settleHodlInvoice(paymentHash: string): Promise<void> {
        const repo = BlocktankDatabase.createEntityManager().getRepository(Bolt11Invoice)
        const invoice = await repo.findOne({ paymentHash: paymentHash, isHodlInvoice: true })
        if (!invoice) {
            throw new Error('Invoice not found')
        }
        const node = LndNodeManager.byPublicKey(invoice.pubkey)
        node.settleHodlInvoice(invoice.secret)
    }

    /**
     * Get the current state of the invoice.
     * @param paymentHash 
     * @returns 
     */
    async getInvoice(paymentHash: string): Promise<Bolt11Invoice> {
        const repo = BlocktankDatabase.createEntityManager().getRepository(Bolt11Invoice)
        const invoice = await repo.findOne({ paymentHash: paymentHash })
        if (!invoice) {
            throw new Error('Invoice not found')
        }
        return invoice
    }

    /**
 * Creates a bolt11 invoice and returns it.
 * @param amountSat Number of satoshi
 * @param description Invoice description
 * @param expiresInMs Invoice expiry time in milliseconds. Default 1hr
 * @returns 
 */
    async createInvoice(amountSat: number, description: string, expiresInMs: number = 60 * 60 * 1000): Promise<Bolt11Invoice> {
        const repo = BlocktankDatabase.orm.em.fork().getRepository(Bolt11Invoice)
        const node = LndNodeManager.random
        const invoice = await repo.createByNodeAndPersist(amountSat, description, node, {
            isHodlInvoice: false,
            expiresInMs: expiresInMs
        })
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
    async orderChannel(connectionString: string, isPrivate: boolean, localBalanceSat: number, pushBalanceSat: number = 0): Promise<OpenChannelOrder> {
        return await ChannelOpenService.openChannel(connectionString, isPrivate, localBalanceSat, pushBalanceSat)
    }

    /**
     * Checks if a node with a minimum onchain balance is available.
     * @param minimumBalanceSat 
     * @returns 
     */
    async isNodeWithMinimumOnchainBalanceAvailable(minimumBalanceSat: number): Promise<boolean> {
        try {
            await LndNodeManager.getRandomWithOnchainBalance(minimumBalanceSat)
            return true
        } catch (e) {
            return false
        }
    }

    /**
     * Returns the channel order.
     * @param id Id of the order.
     * @returns 
     */
    async getOrderedChannel(id: string): Promise<OpenChannelOrder> {
        const order = await ChannelOpenService.getChannelOrder(id)
        if (!order) {
            throw new Error('Channel order not found')
        }
        return order
    }

    /**
     * Pay a lightning invoice.
     * @param request Lightning Bolt11 invoice.
     * @param maxFeePpm Max fee in part per million. Default: 10,000 = 1%.
     * @returns 
     */
    async makePayment(request: string, maxFeePpm: number = 10*1000): Promise<Bolt11Payment> {
        const node = LndNodeManager.random
        return await Bolt11PayService.pay(request, node, maxFeePpm)
    }

    /**
     * Get a payment
     * @param paymentHash payment hash of the invoice.
     * @returns 
     */
    async getPayment(paymentHash: string): Promise<Bolt11Payment> {
        const payment = await Bolt11PayService.getPayment(paymentHash)
        if (!payment) {
            throw new Error('Payment not found')
        }
        return payment
    }

}