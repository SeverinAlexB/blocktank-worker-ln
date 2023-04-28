import {ILndNodeConfig} from '../1_config/ILndNodeConfig'
import {readLndConnectionInfo2} from './ILndConnectionInfo'
import {LndNode} from './LndNode'

const config: ILndNodeConfig = {
    grpcSocket: '127.0.0.1:10001',
    certPath: '/Users/severinbuhler/.polar/networks/4/volumes/lnd/alice/tls.cert',
    macaroonPath: '/Users/severinbuhler/.polar/networks/4/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon'
}

async function nodeFactory() {
    const connectionInfo = readLndConnectionInfo2(config)
    const node = new LndNode(connectionInfo)
    await node.connect()
    return node
}

jest.setTimeout(60*1000)

describe('LndNode', () => {
    test('config read', async () => {
        const node = await nodeFactory()
        
        expect(node.alias).toBeDefined()
        expect(node.publicKey).toBeDefined()
        expect(node.connectionStrings).toBeDefined()
        expect(node.version).toBeDefined()
    });

    xtest('getUnconfirmedInvoices', async () => {
        const node = await nodeFactory()

        const newInvoice = await node.createHodlInvoice(1000, 'test')
        console.log(newInvoice.request)

        const invoices = await node.getHoldingHodlInvoices()
        for (const invoice of invoices) {
            await node.cancelHodlInvoice(invoice.id)
        }
    });


});


