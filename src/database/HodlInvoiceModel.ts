import * as mongoose from 'mongoose'

export enum HodlInvoiceStatus {
    PENDING = 'pending',
    HOLDING = 'holding',
    PAID = 'paid',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
}


export interface IHodlInvoice {
    _id: string; // payment hash
    request: string;
    tokens: number;
    secret: string;
    createdAt: Date;
    expiresAt: Date;
    pubkey: string;
    state: HodlInvoiceStatus;
}

export const hodlInvoiceSchema = new mongoose.Schema<IHodlInvoice>({
    _id: { type: String, required: true }, // payment hash
    request: { type: String, required: true },
    tokens: { type: Number, required: true },
    secret: { type: String, required: true },
    createdAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    pubkey: { type: String, required: true },
    state: { type: String, required: true, default: HodlInvoiceStatus.PENDING },
});

export const HodlInvoice = mongoose.model<IHodlInvoice>('hodlInvoice', hodlInvoiceSchema);