import { ILndNodeConfig } from "../../1_config/ILndNodeConfig"
import { readLndConnectionInfo2 } from "../ILndConnectionInfo"
import { LndNode } from "../LndNode"
import {HodlInvoiceWatcher} from './HodlInvoiceWatcher'


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

describe('HodlInvoiceWatcher', () => {
    xtest('checkNodeOnce', async () => {
        const node = await nodeFactory()
        const watcher = new HodlInvoiceWatcher([] as any)

        const invoice = await node.createHodlInvoice(1000, 'test')
        console.log(invoice.request)
        await watcher.checkNodeOnce(node, (_)=> true)
    });




});


