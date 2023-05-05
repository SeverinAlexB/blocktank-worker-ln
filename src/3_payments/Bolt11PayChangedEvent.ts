import { Bolt11PaymentState } from "../2_database/entities/Bolt11PaymentState"

export interface Bolt11PayChangedEvent {
    paymentHash: string,
    state: {
        old: Bolt11PaymentState,
        new: Bolt11PaymentState
    },
    updatedAt: Date
}