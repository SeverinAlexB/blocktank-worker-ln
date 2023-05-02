import * as ln from 'lightning'

export enum OpenChannelOrderState {
    OPENING = 'opening',
    OPEN = 'open',
    CLOSED = 'closed',
}


export function interferOpenChannelOrderState(channel: ln.GetChannelsResult['channels'][0]) {
    if (!channel) {
        return OpenChannelOrderState.CLOSED
    } else if (channel.is_opening) {
        return OpenChannelOrderState.OPENING
    } else if (channel.is_closing) {
        return OpenChannelOrderState.CLOSED
    } else {
        return OpenChannelOrderState.OPEN
    }
}