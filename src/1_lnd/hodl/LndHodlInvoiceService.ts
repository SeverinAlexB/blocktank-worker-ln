import * as ln from 'lightning'
import { HodlInvoiceState } from './HodlInvoiceState'
import { LndNode } from '../LndNode'
import { HodlInvoiceStateChange } from './IHodlInvoiceStateChange'

export class LndHodlInvoiceService {
    public static async getState(paymentHash: string, node: LndNode): Promise<HodlInvoiceStateChange> {
        const invoice = await node.getInvoice(paymentHash)
        const cltvTimeout = this.lowestBlocktimePaymentExpiry(invoice)
        const state = this.interferState(invoice)
        return {
            state: state,
            cltvTimeoutBlockHeight: cltvTimeout
        }
        
    }

    public static interferState(invoice: ln.GetInvoiceResult): HodlInvoiceState {
        if (invoice.is_canceled) {
            return HodlInvoiceState.CANCELED
        } else if (invoice.is_confirmed) {
            return HodlInvoiceState.PAID
        } else if (invoice.is_held) {
            return HodlInvoiceState.HOLDING
        } else if (new Date(invoice.expires_at).getTime() > Date.now()) {
            return HodlInvoiceState.PENDING
        } else {
            return HodlInvoiceState.EXPIRED
        }
    }

    /**
     * Lowest CLTV expiry block height of incoming payments.
     * Basically the lowest block height at which the invoice needs to be canceled before the channel gets force closed.
     * @param invoice 
     * @returns 
     */
     static lowestBlocktimePaymentExpiry(invoice: ln.GetInvoiceResult): number | undefined {
        if (!invoice.payments || invoice.payments.length === 0) return undefined
        const timeouts = invoice.payments.map(payment => payment.timeout)
        return Math.min(...timeouts)
    }
    static invoiceToUpdate(invoice: ln.GetInvoiceResult, node: LndNode): HodlInvoiceStateChange {
        return {
            state: this.interferState(invoice),
            cltvTimeoutBlockHeight: this.lowestBlocktimePaymentExpiry(invoice)
        }
    }

    static async listenStateEvents(paymentHash: string, node: LndNode, callback: (change: HodlInvoiceStateChange) => any) {
        node.subscribeToInvoice(paymentHash, async invoice => { // Subscribe for new states
            const change = this.invoiceToUpdate(invoice, node)
            await callback(change)
        })
    }



}