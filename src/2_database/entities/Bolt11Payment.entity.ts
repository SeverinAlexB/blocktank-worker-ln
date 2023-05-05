import { Entity, PrimaryKey, Property, SerializedPrimaryKey, Enum, EntityRepositoryType } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { LightningInvoice } from "../../1_lnd/LightningInvoice";
import * as crypto from 'crypto';

import { Bolt11PaymentState } from "./Bolt11PaymentState";
import { Bolt11PaymentRepository } from "../repositories/Bolt11PaymentRepository";


@Entity({
    customRepository: () => Bolt11PaymentRepository,
})
export class Bolt11Payment {
    [EntityRepositoryType]?: Bolt11PaymentRepository;

    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id: string = crypto.randomUUID();

    @Property()
    paymentHash: string

    @Property({nullable: true})
    secret?: string

    @Property()
    request: string;

    @Property()
    satoshi: number;

    @Property()
    milliSatoshi: string;

    @Property()
    ourNodePubkey: string;

    @Property({nullable: true})
    error?: string

    @Enum({
        type: () => Bolt11PaymentState
    })
    state: Bolt11PaymentState = Bolt11PaymentState.INFLIGHT;

    @Property()
    updatedAt: Date = new Date();

    @Property()
    createdAt: Date = new Date();

    get parsedRequest(): LightningInvoice {
        return new LightningInvoice(this.request)
    }
}