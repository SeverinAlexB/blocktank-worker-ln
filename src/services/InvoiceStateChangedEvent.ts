import { HodlInvoiceState } from "../2_database/entities/HodlInvoiceState"

export interface IInvoiceStateChangedEvent {
    paymentHash: string,
    state: {
        old: HodlInvoiceState,
        new: HodlInvoiceState
    },
    changedAt: Date
}