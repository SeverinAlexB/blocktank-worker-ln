
export enum Bolt11PaymentState {
    /**
     * Payment attempt is being done now.
     */
    INFLIGHT = 'inflight',
    /**
     * Payment confirmed
     */
    PAID = 'paid',
    /**
     * Payment failed.
     */
    FAILED = 'failed',
}