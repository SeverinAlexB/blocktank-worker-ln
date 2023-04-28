import { Entity, PrimaryKey, Property, SerializedPrimaryKey, Enum, EntityRepositoryType } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { HodlInvoiceRepository } from "../repositories/HodlInvoiceRepository";
import { HodlInvoiceState, interferInvoiceState } from "./HodlInvoiceState";
import { LightningInvoice } from "../../1_lnd/LightningInvoice";
import * as crypto from 'crypto';
import { LndNode } from "../../1_lnd/lndNode/LndNode";


@Entity({
    customRepository: () => HodlInvoiceRepository,
})
export class HodlInvoice {
    [EntityRepositoryType]?: HodlInvoiceRepository;

    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id: string = crypto.randomUUID();

    @Property()
    paymentHash: string

    @Property()
    request: string;

    @Property()
    tokens: number;

    @Property()
    secret: string;

    @Property()
    pubkey: string;

    @Enum({
        type: () => HodlInvoiceState
    })
    state: HodlInvoiceState = HodlInvoiceState.PENDING;

    @Property()
    createdAt: Date;

    @Property()
    expiresAt: Date;

    get parsedRequest(): LightningInvoice {
        return new LightningInvoice(this.request)
    }

    async refreshState(node: LndNode) {
        const invoice = await node.getInvoice(this.paymentHash)
        this.state = interferInvoiceState(invoice)
    }
}