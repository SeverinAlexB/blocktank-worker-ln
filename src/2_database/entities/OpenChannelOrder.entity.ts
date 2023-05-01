import { Entity, PrimaryKey, Property, SerializedPrimaryKey, Enum, EntityRepositoryType } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { HodlInvoiceRepository } from "../repositories/HodlInvoiceRepository";
import * as crypto from 'crypto';
import {OpenChannelOrderState} from './OpenChannelOrderState'



@Entity({
    // customRepository: () => HodlInvoiceRepository,
})
export class OpenChannelOrder {
    // [EntityRepositoryType]?: HodlInvoiceRepository;

    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id: string = crypto.randomUUID();

    @Property()
    publicKey: string

    @Property()
    address: string;

    @Property()
    isPrivate: boolean;

    @Property()
    localBalanceSat: number;

    @Property()
    pushBalanceSat: number;

    @Enum({
        type: () => OpenChannelOrderState
    })
    state: OpenChannelOrderState = OpenChannelOrderState.OPENING;

    @Property()
    txId: string;

    @Property()
    txVout: number;

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    @Property()
    createdAt: Date = new Date();
}