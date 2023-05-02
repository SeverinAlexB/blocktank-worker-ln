import { OpenChannelOrder } from "../2_database/entities/OpenChannelOrder.entity"
import { OpenChannelOrderState } from "../2_database/entities/OpenChannelOrderState"

export interface IChannelUpdateEvent {
    orderId: string,
    state: {
        old: OpenChannelOrderState,
        new: OpenChannelOrderState
    },
    updatedAt: Date
}

export function toChannelUpdateEvent(order: OpenChannelOrder, oldState: OpenChannelOrderState, newState: OpenChannelOrderState): IChannelUpdateEvent {
    return {
        orderId: order.id,
        state: {
            old: oldState,
            new: newState
        },
        updatedAt: new Date()
    }
}