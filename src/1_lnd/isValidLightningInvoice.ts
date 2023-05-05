import { AppConfig } from "../1_config/Config"
import { LightningInvoice } from "../1_lnd/LightningInvoice"



export interface IIsValidLightningInvoice {
    isValid: boolean,
    error?: {
        code: string,
        message: string
    }
    invoice?: LightningInvoice
}

export default function isValidLightningInvoice(encoded: string): IIsValidLightningInvoice {
    const config = AppConfig.get()
    try {
        const invoice = new LightningInvoice(encoded)
        if (invoice.expiresWithin(30)) {
            return {
                isValid: false,
                error: {
                    message: "Invoice must be valid for at least 30 seconds.",
                    code: "invalidExpiry"
                }
            }
        }
        if (!invoice.satoshi) {
            return {
                isValid: false,
                error: {
                    message: "Zero amount invoices are not supported.",
                    code: 'invalidAmount'
                }
            }
        }
        if (invoice.network !== config.bitcoinNetwork) {
            return {
                isValid: false,
                error: {
                    message: `Bitcoin network ${config.bitcoinNetwork} required.`,
                    code: 'invalidNetwork'
                }
            }
        }
        if (invoice.satoshi > Number.MAX_SAFE_INTEGER) {
            return {
                isValid: false,
                error: {
                    message: `Satoshi can't be higher than ${Number.MAX_SAFE_INTEGER}`,
                    code: 'invalidAmount'
                }
            }
        }
        return {
            isValid: true,
            invoice: invoice
        }
    } catch (e) {
        console.info('Decoding invoice failed:', e)
        return {
            isValid: false,
            error: {
                message: "Decoding failed.",
                code: 'invalidInvoice'
            }
        }
    }
}