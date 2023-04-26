import { Entity, PrimaryKey, Property, SerializedPrimaryKey, Enum, EntityRepositoryType } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { LndNode } from "../../1_lnd/LndNode";
import { HodlInvoiceRepository } from "../repositories/HodlInvoiceRepository";
import { HodlInvoiceState } from "../../1_lnd/hodl/HodlInvoiceState";
import { LightningInvoice } from "../../1_lnd/LightningInvoice";
import { LndHodlInvoiceService } from "../../1_lnd/hodl/LndHodlInvoiceService";
import { HodlInvoiceStateChange } from "../../1_lnd/hodl/IHodlInvoiceStateChange";



@Entity({
    customRepository: () => HodlInvoiceRepository,
})
export class HodlInvoice {
    [EntityRepositoryType]?: HodlInvoiceRepository;

    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

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

    /**
     * Blockheight before the payment needs to be released otherwise the channel will be force closed.
     * Only available in state "holding".
     */
    @Property({nullable: true})
    paymentCltvTimeout: number

    @Property()
    createdAt: Date;

    @Property()
    expiresAt: Date;

    get parsedRequest(): LightningInvoice {
        return new LightningInvoice(this.request)
    }

    /**
     * Listen to state events. Important: Not every event is a new state update.
     * @param node 
     * @param callback 
     */
    async listenStateEvents(node: LndNode, callback: (change: HodlInvoiceStateChange) => any) {
        // Catch up on the latest state in case it changed while we were offline
        const newState = await LndHodlInvoiceService.getState(this.id, node) 
        await callback(newState)

        LndHodlInvoiceService.listenStateEvents(this.id, node, async update => {
            await callback(update)
        })
    }

    async refreshState(node: LndNode) {
        const change = await LndHodlInvoiceService.getState(this.id, node)
        this.state = change.state
        this.paymentCltvTimeout = change.cltvTimeoutBlockHeight
    }
}