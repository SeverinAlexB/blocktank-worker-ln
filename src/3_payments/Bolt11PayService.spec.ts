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
        const invoice = 'lnbcrt10u1pj9saynpp5v8a35m2e3z02en6ulk0qkuwqjwdzq36mnfsrscc48t6lagh3ympsdqqcqzzsxqyz5vqsp5sm7k9tkqdwxv2dr9s92z6e7nvld50ea2nx46ychk5x7s8w2x8tgs9qyyssqa5pyewredu8g5h93h7t80fv6jrna6c9uc7eljq4j2cjhh8dl4rjyaxl2jywrry74nms623s8zfv267wec90deagkcn8m02z8ay8jv4spcary4t'
        try {
            await Bolt11PayService.pay(invoice, node, 10000)
            console.log('done')
        } catch (e) {
            console.log('error', e)
        }
    });

    test('Pay invalid invoice', async () => {
        const node = LndNodeManager.nodes[0]
        const invoice = FakeInvoice.create({
            amountSat: 1000*1000*1000,
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
        const invoice = 'lnbcrt100u1pj9su6epp5aj96tgxsfm7ax6y35dl8wvt9nax4v5ryp6k4jkhvarap5d2l92qsdqqcqzzsxqyz5vqsp5e2zm68sat8gjepr5e8lyf884xewhx8c8rwr5wx9lwfwq4jjhpa4s9qyyssqlguc2u6u6ze8qtx3e9qmge7eppa5txvgxfc02gvuq8dxh036qa65e82048gd7clv76mwtc5pmp59l7336zsexhs7n0dfrzy4tsavp7cpa428ky'
        
        const repo = BlocktankDatabase.orm.em.fork().getRepository(Bolt11Payment)
        const pay = await repo.createByNodeAndPersist(invoice, node)
        console.log('pay', pay)
    });

});


