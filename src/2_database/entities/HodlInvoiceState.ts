import * as ln from 'lightning'

export enum HodlInvoiceState {
    /**
     * Expect payment
     */
    PENDING = 'pending',
    /**
     * Payment received but not confirmed/rejected yet
     */
    HOLDING = 'holding',
    /**
     * Payment confirmed
     */
    PAID = 'paid',
    /**
     * Payment rejected or invoice expired.
     */
    CANCELED = 'canceled',
}


export function interferInvoiceState(invoice: ln.GetInvoiceResult): HodlInvoiceState {
    if (invoice.is_canceled) {
        return HodlInvoiceState.CANCELED
    } else if (invoice.is_confirmed) {
        return HodlInvoiceState.PAID
    } else if (invoice.is_held) {
        return HodlInvoiceState.HOLDING
    } else if (new Date(invoice.expires_at).getTime() > Date.now()) {
        return HodlInvoiceState.PENDING
    } else {
        throw new Error(`Unknown state`, {
            cause: invoice
        })
    }
}

export function interferInvoiceChangedAt(invoice: ln.GetInvoiceResult): Date {
    const state = interferInvoiceState(invoice)
    if (state === HodlInvoiceState.PENDING) {
        return new Date(invoice.created_at)
    } else if (state === HodlInvoiceState.HOLDING) {
        // When last payment arrived
        const arrivals = invoice.payments.map(p =>  new Date(p.created_at).getTime())
        return new Date(Math.max(...arrivals))
    } else if (state === HodlInvoiceState.PAID) {
        return new Date(invoice.confirmed_at)
    } else if (state === HodlInvoiceState.CANCELED) {
        // Can't interfer this from the invoice so just take the current datetime.
        return new Date()
    } else {
        throw new Error(`Unknown state ${state}`)
    }
}