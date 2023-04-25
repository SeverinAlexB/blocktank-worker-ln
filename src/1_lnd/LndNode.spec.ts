import {ILndNodeConfig} from '../1_config/ILndNodeConfig'
import {readLndConnectionInfo2} from './ILndConnectionInfo'
import {LndNode} from './LndNode'
import * as ln from 'lightning'
import {sleep} from 'blocktank-worker2/dist/utils'
import { GetInvoiceResult } from 'lightning/lnd_methods/invoices/get_invoice'

const config: ILndNodeConfig = {
    grpcSocket: '127.0.0.1:10001',
    certPath: '/Users/severinbuhler/.polar/networks/4/volumes/lnd/alice/tls.cert',
    macaroonPath: '/Users/severinbuhler/.polar/networks/4/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon'
}

jest.setTimeout(60*1000)

describe('LndNode', () => {
    test('config read', async () => {


        const connectionInfo = readLndConnectionInfo2(config)
        const node = new LndNode(connectionInfo)
        await node.connect()
        
        expect(node.alias).toBeDefined()
        expect(node.publicKey).toBeDefined()
        expect(node.connectionStrings).toBeDefined()
        expect(node.version).toBeDefined()
    });

    test('hodl cancel invoice update', async () => {
        const connectionInfo = readLndConnectionInfo2(config)
        const node = new LndNode(connectionInfo)
        await node.connect()

        const result = await node.createHodlInvoice(1000, 'test')

        // const waitOnUpdate = new Promise<GetInvoiceResult>((resolve, reject) => {
        //     node.onInvoiceUpdate(result.id, async (invoice) => {
        //         resolve(invoice)
        //     })
        // })

        await node.cancelHodlInvoice(result.id)
        // const invoice = await waitOnUpdate
        // expect(invoice.is_canceled).toEqual(true)
    });

    test('hodl fulfill invoice update', async () => {
        const connectionInfo = readLndConnectionInfo2(config)
        const node = new LndNode(connectionInfo)
        await node.connect()

        const result = await node.createHodlInvoice(1000, 'test')

        node.subscribeToInvoice(result.id, async invoice => {
            console.log('invoice', invoice)
        })


        // console.log('secret', result.secret)
        // console.log('invoice', result.request)

        await sleep(2*1000)
        console.log('cancel invoice')
        await node.cancelHodlInvoice(result.id)
        const canceled = await node.getInvoice(result.id)
        console.log('canceled', canceled)
        // const waitOnUpdate = new Promise<ln.GetInvoiceResult>((resolve, reject) => {
        //     node.onInvoiceUpdate(result.id, async (invoice) => {
        //         resolve(invoice)
        //     })
        // })
        await sleep(2*1000)

        await sleep(2*1000)
        // await node.cancelHodlInvoice(result.id)
        // const invoice = await waitOnUpdate
        // expect(invoice.is_canceled).toEqual(true)
    });
});


