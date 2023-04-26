import { HodlInvoiceState } from "./HodlInvoiceState";

export interface HodlInvoiceStateChange {
    state: HodlInvoiceState,
    /**
     * Lowest CLTV expiry block height of incoming payment.
     * Only available if state==HOLDING
     */
    cltvTimeoutBlockHeight?: number,
}