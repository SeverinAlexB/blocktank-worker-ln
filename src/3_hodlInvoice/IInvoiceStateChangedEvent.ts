import { Bolt11Invoice } from "../2_database/entities/Bolt11Invoice.entity"
import { Bolt11InvoiceState } from "../2_database/entities/Bolt11InvoiceState"

export interface IInvoiceStateChangedEvent {
    paymentHash: string,
    state: {
        old: Bolt11InvoiceState,
        new: Bolt11InvoiceState
    },
    updatedAt: Date
}

export function toInvoiceStateChangedEvent(invoice: Bolt11Invoice, oldState: Bolt11InvoiceState, newState: Bolt11InvoiceState): IInvoiceStateChangedEvent {
    return {
        paymentHash: invoice.paymentHash,
        state: {
            old: oldState,
            new: newState
        },
        updatedAt: invoice.updatedAt
    }
}