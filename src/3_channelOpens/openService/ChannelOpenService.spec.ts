import {ILndNodeConfig} from '../../1_config/ILndNodeConfig'
import { readLndConnectionInfo2 } from '../../1_lnd/lndNode/ILndConnectionInfo'
import { LndNode } from '../../1_lnd/lndNode/LndNode'
import { LndNodeManager } from '../../1_lnd/lndNode/LndNodeManager'
import { ChannelOpenService } from './ChannelOpenService'

import { OpenChannelOrderState } from '../../2_database/entities/OpenChannelOrderState'
import { ChannelOpenError } from './ChannelOpenError'

const config: ILndNodeConfig = {
    grpcSocket: '127.0.0.1:10001',
    certPath: '/Users/severinbuhler/.polar/networks/4/volumes/lnd/alice/tls.cert',
    macaroonPath: '/Users/severinbuhler/.polar/networks/4/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon'
}

jest.setTimeout(60*1000)

async function nodeFactory(): Promise<LndNode> {
    const connectionInfo = readLndConnectionInfo2(config)
    const node = new LndNode(connectionInfo)
    await node.connect()
    return node
}

beforeEach(async () => {
    /**
     * Initialize the LndNodeManager with a single node.
     */
    LndNodeManager.nodes = [await nodeFactory()]
})

describe('ChannelOpenService', () => {

    test('Channel open', async () => {
        const connectionString = '036d55df4877f1c5cbcc57d6eba65b07d16598396aa8de8a57c6e21cdeae7f0c8e@172.24.0.4:9735'

        const open = await ChannelOpenService.openChannel(connectionString, false, 100000, 50000)
        expect(open.peerPublicKey).toEqual('036d55df4877f1c5cbcc57d6eba65b07d16598396aa8de8a57c6e21cdeae7f0c8e')
        expect(open.isPrivate).toEqual(false)
        expect(open.state).toEqual(OpenChannelOrderState.OPENING)
        console.log('open', open)
    });

    test('JSON dump Error', async () => {
        const error = new ChannelOpenError('myMessage', 'myCode', 1)
        const restored = JSON.parse(JSON.stringify(error))
        expect(restored.code).toEqual('myCode')
        expect(restored.message).toEqual('myMessage')
        expect(restored.codeNumber).toEqual(1)
    });

    test('GetChannel with txid', async () => {
        const pubkey = '036d55df4877f1c5cbcc57d6eba65b07d16598396aa8de8a57c6e21cdeae7f0c8e'
        const node = LndNodeManager.nodes[0]
        const channel = await node.getChannel('10ee88293e3d7dfb9bfba0804103a4873aa69dcfb8a32b09cf03e29958ec11cb', 0, pubkey)
        // expect(channel.id).toEqual('487x1x0')
    });
});


