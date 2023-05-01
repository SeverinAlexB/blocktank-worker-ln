import { HodlInvoice } from "../2_database/entities/HodlInvoice.entity"
import { HodlInvoiceState } from "../2_database/entities/HodlInvoiceState"

export interface IInvoiceStateChangedEvent {
    paymentHash: string,
    state: {
        old: HodlInvoiceState,
        new: HodlInvoiceState
    },
    updatedAt: Date
}

export function toInvoiceStateChangedEvent(invoice: HodlInvoice, oldState: HodlInvoiceState, newState: HodlInvoiceState): IInvoiceStateChangedEvent {
    return {
        paymentHash: invoice.paymentHash,
        state: {
            old: oldState,
            new: newState
        },
        updatedAt: invoice.updatedAt
    }
}