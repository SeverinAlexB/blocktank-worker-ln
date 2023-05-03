import { Entity, PrimaryKey, Property, SerializedPrimaryKey, Enum, EntityRepositoryType } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { Bolt11InvoiceRepository } from "../repositories/Bolt11InvoiceRepository";
import { Bolt11InvoiceState, interferInvoiceState } from "./Bolt11InvoiceState";
import { LightningInvoice } from "../../1_lnd/LightningInvoice";
import * as crypto from 'crypto';
import { LndNode } from "../../1_lnd/lndNode/LndNode";


@Entity({
    customRepository: () => Bolt11InvoiceRepository,
})
export class Bolt11Invoice {
    [EntityRepositoryType]?: Bolt11InvoiceRepository;

    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id: string = crypto.randomUUID();

    @Property()
    isHodlInvoice: boolean = false;

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
        type: () => Bolt11InvoiceState
    })
    state: Bolt11InvoiceState = Bolt11InvoiceState.PENDING;

    @Property()
    updatedAt: Date;

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