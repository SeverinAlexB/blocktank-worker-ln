import { LndNode } from "../LndNode";
import * as ln from 'lightning'
import { LndHodlInvoiceService } from "./LndHodlInvoiceService";


interface HodlInvoiceWatcherOptions {
    cancelPaymentsBeforeCltvBlocks: number,
    intervalMs: number,
}

const defaultHodlInvoiceWatcherOptions: HodlInvoiceWatcherOptions = {
    cancelPaymentsBeforeCltvBlocks: 6,
    intervalMs: 60*1000
}

type BeforeCancelInvoiceHookFn = (invoice: ln.GetInvoiceResult, node: LndNode) => boolean | Promise<boolean>

/**
 * Watches HodlInvoices and cancels them when they get too close to the CLTV timeout.
 */
export class HodlInvoiceWatcher {
    private interval: NodeJS.Timer;
    public options: HodlInvoiceWatcherOptions;
    constructor(public nodes: LndNode[], options: Partial<HodlInvoiceWatcherOptions> = {}) {
        this.options = Object.assign({}, defaultHodlInvoiceWatcherOptions, options)
    }

    /**
     * Watches hodl invoices that are about to run into the CLTV expiry. This would lead to a channel force close.
     * This watcher cancels the payment so this does not happen.
     * @param shouldCancel Callback. Confirm canceling by returning true.
     */
    async watch(shouldCancel: BeforeCancelInvoiceHookFn = ()=>true) {
        if (this.interval) {
            throw new Error('Already watching')
        }

        this.interval = setInterval(async() => {
            this.checkOnce(shouldCancel)
        }, this.options.intervalMs)

    }

    /**
     * Check nodes for critical hodl invoices that will expire soon.
     * @param shouldCancel Callback. Confirm canceling by returning true.
     */
    async checkOnce(shouldCancel: BeforeCancelInvoiceHookFn) {
        for (const node of this.nodes) {
            try {
                await this.checkNodeOnce(node, shouldCancel)
            } catch (e) {
                console.error(`Unexpected error checking ${node.publicKey} for critical hodl invoices.`, e)
            }
        }
    }

    /**
     * Check one node for critical hodl invoices that will expire soon.
     * @param node 
     * @param shouldCancel Callback. Confirm canceling by returning true.
     */
    async checkNodeOnce(node: LndNode, shouldCancel: BeforeCancelInvoiceHookFn) {
        const invoices = await node.getHoldingHodlInvoices()
        const info = await node.getInfo()
        
        for (const invoice of invoices) {
            const cltvExpiry = LndHodlInvoiceService.lowestBlocktimePaymentExpiry(invoice)
            const blocksUntilTimeout = cltvExpiry - info.current_block_height
            if (blocksUntilTimeout < this.options.cancelPaymentsBeforeCltvBlocks) {
                try {
                    const cancelConfirmed = await shouldCancel(invoice, node)
                    if (!cancelConfirmed) {
                        continue
                    }
                } catch (e) {
                    console.error('HodlInvoiceWatcher Callback `shouldCancel` did throw an unexpected error. Cancel anyway.', e)
                }
                try {
                    await node.cancelHodlInvoice(invoice.id)
                    console.log(`Canceled invoice ${invoice.id} because it expires at block ${cltvExpiry}. Current block height: ${info.current_block_height}.`)
                } catch (e) {
                    console.error(`Could not cancel invoice ${invoice.id}.`, e)
                }
            }
        }
    }

    async stop() {
        if (this.interval) {
            clearInterval(this.interval)
        }
    }
}