import * as invoice from "@node-lightning/invoice"
import BitcoinNetworkEnum from "./BitcoinNetworkEnum"

// https://github.com/lightning/bolts/blob/f7dcc32694b8cd4f3a1768b904f58cb177168f29/11-payment-encoding.md#human-readable-part
// Copied from Blocktank Instant repository
// https://github.com/synonymdev/blocktank-instant/blob/master/src/1_lightning/LightningInvoice.ts


export class LightningInvoice {
    public decoded: invoice.Invoice
    constructor(public encoded: string) {
        this.decoded = invoice.decode(encoded)
    }

    get satoshi(): number {
        return Number.parseInt(this.decoded.valueSat)
    }

    get milliSatoshi(): string {
        return this.decoded.valueMsat
    }

    get id(): string {
        return this.paymentHash
    }

    get paymentHash(): string {
        return this.decoded.paymentHash.toString('hex')
    }

    get description(): string {
        return this.decoded.shortDesc
    }

    get createdAt(): Date {
        return new Date(this.decoded.timestamp*1000)
    }

    get expiresAt(): Date {
        return new Date((this.decoded.timestamp + this.decoded.expiry)*1000)
    }

    get isExpired(): boolean {
        return this.expiresAt.getTime() < new Date().getTime()
    }

    get includesMsat(): boolean {
        const msatStr = this.decoded.valueMsat
        const last3Numbers = msatStr.slice(-3)
        const number = Number.parseInt(last3Numbers)
        return number > 0
    }

    get network(): BitcoinNetworkEnum {
        switch (this.decoded.network) {
            case 'bc': {
                return BitcoinNetworkEnum.MAINNET
            };
            case 'tb': {
                return BitcoinNetworkEnum.TESTNET
            };
            case 'tbs': {
                return BitcoinNetworkEnum.SIGNET
            };
            case 'bcrt': {
                return BitcoinNetworkEnum.REGTEST
            };
        }

    }

    expiresWithin(seconds: number): boolean {
        const xSecondsInTheFuture = new Date(new Date().getTime() + seconds*1000)
        return this.expiresAt.getTime() <= xSecondsInTheFuture.getTime()
    }
}

