import {ILndNodeConfig} from '../../1_config/ILndNodeConfig'
import { readLndConnectionInfo2 } from '../../1_lnd/lndNode/ILndConnectionInfo'

import {BlocktankDatabase} from 'blocktank-worker2'
import { LndNode } from '../../1_lnd/lndNode/LndNode'
import { Bolt11Invoice } from './Bolt11Invoice.entity'
import { Bolt11InvoiceState } from './Bolt11InvoiceState'


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

describe('Bolt11Invoice', () => {

    test('Create hold invoice', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(Bolt11Invoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node, {isHodlInvoice: true})
        await em.flush()
        
        expect(invoice.createdAt).toBeDefined()
        expect(invoice.expiresAt).toBeDefined()
        expect(invoice.request).toBeDefined()
        expect(invoice.pubkey).toEqual(node.publicKey)
        expect(invoice.secret).toBeDefined()
        expect(invoice.state).toEqual(Bolt11InvoiceState.PENDING)
        expect(invoice.tokens).toEqual(1000)
    });

    test('Create normal invoice', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(Bolt11Invoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node, {isHodlInvoice: false})
        await em.flush()
        
        expect(invoice.createdAt).toBeDefined()
        expect(invoice.expiresAt).toBeDefined()
        expect(invoice.request).toBeDefined()
        expect(invoice.pubkey).toEqual(node.publicKey)
        expect(invoice.secret).toBeDefined()
        expect(invoice.state).toEqual(Bolt11InvoiceState.PENDING)
        expect(invoice.tokens).toEqual(1000)
    });

    // test('Cancel invoice', async () => {
    //     const node = await nodeFactory()
    //     const em = BlocktankDatabase.createEntityManager()
    //     const repo = em.getRepository(Bolt11Invoice)
    //     const invoice = await repo.createByNodeAndPersist(1000, 'test', node)
    //     await em.flush()
    //     await repo.cancelAndPersist(invoice, node)
    //     await em.flush()
    //     expect(invoice.state).toEqual(Bolt11InvoiceState.CANCELED)
    // });

    xtest('Cancel held invoice', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(Bolt11Invoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node, {isHodlInvoice: true})
        await em.flush()
        console.log('invoice', invoice.request)

        // DO: Actually pay the invoice on another node!

        await invoice.refreshState(node)
        expect(invoice.state).toEqual(Bolt11InvoiceState.HOLDING)

        await node.cancelHodlInvoice(invoice.id)
        await invoice.refreshState(node)
        
        expect(invoice.state).toEqual(Bolt11InvoiceState.CANCELED)
    });

    xtest('fulfill invoice', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(Bolt11Invoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node, {isHodlInvoice: true})
        await em.flush()
        console.log('invoice', invoice.request)

        // DO: Actually pay the invoice on another node!

        await invoice.refreshState(node)
        expect(invoice.state).toEqual(Bolt11InvoiceState.HOLDING)

        await node.settleHodlInvoice(invoice.secret)
        await invoice.refreshState(node)
        
        expect(invoice.state).toEqual(Bolt11InvoiceState.PAID)
    });


});


