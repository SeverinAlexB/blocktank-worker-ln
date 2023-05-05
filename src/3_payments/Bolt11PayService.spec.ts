import { BlocktankDatabase } from "blocktank-worker2"
import { ILndNodeConfig } from "../1_config/ILndNodeConfig"
import { LightningInvoice } from "../1_lnd/LightningInvoice"
import { readLndConnectionInfo2 } from "../1_lnd/lndNode/ILndConnectionInfo"
import { LndNode } from "../1_lnd/lndNode/LndNode"
import { LndNodeManager } from "../1_lnd/lndNode/LndNodeManager"
import { Bolt11PayService } from "./Bolt11PayService"
import { Bolt11Payment } from "../2_database/entities/Bolt11Payment.entity"
import FakeInvoice from "../1_lnd/FakeInvoice"

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
        const invoice = FakeInvoice.create({
            amountSat: 1000,
            description: 'test',
        })
        try {
            await Bolt11PayService.pay(invoice, node, 10000)
            console.log('done')
        } catch (e) {
            console.log('error', e)
        }

    });

    test('Create pay', async () => {
        const node = LndNodeManager.nodes[0]
        const invoice = 'lnbcrt10u1pj9fjffpp52fsreq4e05u9pdprdldm4vnml2ffymwfk7grv8tmulfnhh2sftjqdqqcqzpgxqyz5vqsp542cvxf56gxskdz8xpwcytvz0k9238fkxyjgyqgpa39x4ellveunq9qyyssqlcr5f47u8q35cta8ktjuhdkfs5t6kkytmfhgx2qftje5ukuudv34d35228ukdxrjmxfdpyfcfuf46ghy6r8cezyadnkrwcxpc559n4cq2fkat2'
        
        const repo = BlocktankDatabase.orm.em.fork().getRepository(Bolt11Payment)
        const pay = await repo.createByNodeAndPersist(invoice, node)
        console.log('pay', pay)
    });

});


