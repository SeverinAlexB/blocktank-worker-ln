import { ILndNodeConfig } from "../1_config/ILndNodeConfig"
import { readLndConnectionInfo2 } from "../1_lnd/lndNode/ILndConnectionInfo"
import { LndNode } from "../1_lnd/lndNode/LndNode"
import { LndNodeManager } from "../1_lnd/lndNode/LndNodeManager"
import { Bolt11PayService } from "./Bolt11PayService"

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

describe('Bolt11PayService', () => {

    test('Pay', async () => {
        const node = LndNodeManager.nodes[0]
        const invoice = 'lnbcrt10u1pj9ffl2pp55hx0uh5x2m9cc37ue7jnu7aw2a7s5xsdthcxj09mhg5zk3hre5hsdqqcqzpgxqyz5vqsp58up03leum5q5pfw65klac9dk0twajjst8jlnmu4pcst6q2s4k8fs9qyyssqr3yhdanw95897xtefzk7l0a83nemyqjr8umgdpmd42agh6frvp3kke2d0gg4f4ydamj8xy4z7npt05tctxjd4shnpfmz9k362gtmkpspmukamy'
        await Bolt11PayService.pay(invoice, node, 10000)
    });

});


