import * as ln from 'lightning'

export enum Bolt11InvoiceState {
    /**
     * Expect payment
     */
    PENDING = 'pending',
    /**
     * Payment received but not confirmed/rejected yet. Only possible with HODL invoices.
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


export function interferInvoiceState(invoice: ln.GetInvoiceResult): Bolt11InvoiceState {
    if (invoice.is_canceled) {
        return Bolt11InvoiceState.CANCELED
    } else if (invoice.is_confirmed) {
        return Bolt11InvoiceState.PAID
    } else if (invoice.is_held) {
        return Bolt11InvoiceState.HOLDING
    } else if (new Date(invoice.expires_at).getTime() > Date.now()) {
        return Bolt11InvoiceState.PENDING
    } else {
        throw new Error(`Unknown state`, {
            cause: invoice
        })
    }
}

export function interferInvoiceChangedAt(invoice: ln.GetInvoiceResult): Date {
    const state = interferInvoiceState(invoice)
    if (state === Bolt11InvoiceState.PENDING) {
        return new Date(invoice.created_at)
    } else if (state === Bolt11InvoiceState.HOLDING) {
        // When last payment arrived
        const arrivals = invoice.payments.map(p =>  new Date(p.created_at).getTime())
        return new Date(Math.max(...arrivals))
    } else if (state === Bolt11InvoiceState.PAID) {
        return new Date(invoice.confirmed_at)
    } else if (state === Bolt11InvoiceState.CANCELED) {
        // Can't interfer this from the invoice so just take the current datetime.
        return new Date()
    } else {
        throw new Error(`Unknown state ${state}`)
    }
}