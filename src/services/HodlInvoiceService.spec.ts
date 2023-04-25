import {ILndNodeConfig} from '../1_config/ILndNodeConfig'

import * as ln from 'lightning'
import {sleep} from 'blocktank-worker2/dist/utils'
import { GetInvoiceResult } from 'lightning/lnd_methods/invoices/get_invoice'
import { readLndConnectionInfo2 } from '../1_lnd/ILndConnectionInfo'
import { LndNode } from '../1_lnd/LndNode'
import {HodlInvoiceService} from './HodlInvoiceService'
import { LndNodes } from '../1_lnd/LndNodes'
import { HodlInvoiceStatus } from '../database/HodlInvoiceModel'

const config: ILndNodeConfig = {
    grpcSocket: '127.0.0.1:10001',
    certPath: '/Users/severinbuhler/.polar/networks/4/volumes/lnd/alice/tls.cert',
    macaroonPath: '/Users/severinbuhler/.polar/networks/4/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon'
}

jest.setTimeout(60*1000)

async function serviceFactory(): Promise<HodlInvoiceService> {
    const connectionInfo = readLndConnectionInfo2(config)
    const node = new LndNode(connectionInfo)
    await node.connect()
    return new HodlInvoiceService(new LndNodes([node]))
}

describe('HodlInvoiceService', () => {


    test('Create invoice', async () => {
        const service = await serviceFactory()
        const invoice = await service.createInvoice(1000, 'test')
        expect(invoice.createdAt).toBeDefined()
        expect(invoice.expiresAt).toBeDefined()
        expect(invoice.request).toBeDefined()
        expect(invoice.pubkey).toEqual(service.nodes.nodes[0].publicKey)
        expect(invoice.secret).toBeDefined()
        expect(invoice.state).toEqual(HodlInvoiceStatus.PENDING)
        expect(invoice.tokens).toEqual(1000)
    });

    test('Cancel invoice', async () => {
        const service = await serviceFactory()
        const invoice = await service.createInvoice(1000, 'test')
        const updated = await service.cancelInvoice(invoice._id)
        expect(updated.state).toEqual(HodlInvoiceStatus.CANCELED)
    });

    // test('hodl fulfill invoice update', async () => {
    //     const connectionInfo = readLndConnectionInfo2(config)
    //     const node = new LndNode(connectionInfo)
    //     await node.connect()

    //     const result = await node.createHodlInvoice(1000, 'test')

    //     node.subscribeToInvoice(result.id, async invoice => {
    //         console.log('invoice', invoice)
    //     })


    //     // console.log('secret', result.secret)
    //     // console.log('invoice', result.request)

    //     await sleep(2*1000)
    //     console.log('cancel invoice')
    //     await node.cancelHodlInvoice(result.id)
    //     const canceled = await node.getInvoice(result.id)
    //     console.log('canceled', canceled)
    //     // const waitOnUpdate = new Promise<ln.GetInvoiceResult>((resolve, reject) => {
    //     //     node.onInvoiceUpdate(result.id, async (invoice) => {
    //     //         resolve(invoice)
    //     //     })
    //     // })
    //     await sleep(2*1000)

    //     await sleep(2*1000)
    //     // await node.cancelHodlInvoice(result.id)
    //     // const invoice = await waitOnUpdate
    //     // expect(invoice.is_canceled).toEqual(true)
    // });
});


