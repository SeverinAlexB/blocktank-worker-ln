import {ILndNodeConfig} from '../../1_config/ILndNodeConfig'
import { readLndConnectionInfo2 } from '../../1_lnd/ILndConnectionInfo'
import { LndNode } from '../../1_lnd/LndNode'
import { HodlInvoiceState } from '../../1_lnd/hodl/HodlInvoiceState'
import { HodlInvoice } from './HodlInvoice.entity'
import {BlocktankDatabase} from 'blocktank-worker2'
import {sleep} from 'blocktank-worker2/dist/utils'

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

describe('HodlInvoiceModel', () => {

    test('Create invoice', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(HodlInvoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node)
        await em.flush()
        
        expect(invoice.createdAt).toBeDefined()
        expect(invoice.expiresAt).toBeDefined()
        expect(invoice.request).toBeDefined()
        expect(invoice.pubkey).toEqual(node.publicKey)
        expect(invoice.secret).toBeDefined()
        expect(invoice.state).toEqual(HodlInvoiceState.PENDING)
        expect(invoice.tokens).toEqual(1000)
    });

    test('Cancel invoice', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(HodlInvoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node)
        await em.flush()
        await repo.cancelAndPersist(invoice, node)
        await em.flush()
        expect(invoice.state).toEqual(HodlInvoiceState.CANCELED)
    });

    xtest('Cancel held invoice', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(HodlInvoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node)
        await em.flush()
        console.log('invoice', invoice.request)

        // DO: Actually pay the invoice on another node!

        await invoice.refreshState(node)
        expect(invoice.state).toEqual(HodlInvoiceState.HOLDING)

        await node.cancelHodlInvoice(invoice.id)
        await invoice.refreshState(node)
        
        expect(invoice.state).toEqual(HodlInvoiceState.CANCELED)
    });

    xtest('fulfill invoice', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(HodlInvoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node)
        await em.flush()
        console.log('invoice', invoice.request)

        // DO: Actually pay the invoice on another node!

        await invoice.refreshState(node)
        expect(invoice.state).toEqual(HodlInvoiceState.HOLDING)

        await node.settleHodlInvoice(invoice.secret)
        await invoice.refreshState(node)
        
        expect(invoice.state).toEqual(HodlInvoiceState.PAID)
    });

    xtest('Cancel event', async () => {
        const node = await nodeFactory()
        const em = BlocktankDatabase.createEntityManager()
        const repo = em.getRepository(HodlInvoice)
        const invoice = await repo.createByNodeAndPersist(1000, 'test', node)

        await invoice.listenStateEvents(node, (newState) => {
            console.log(new Date(), 'Status changed to', newState)
        })
        console.log('invoice', invoice.request)

        // DO: Actually pay the invoice on another node!
        await sleep(1*1000)

        await repo.cancelAndPersist(invoice, node)
        await sleep(10*1000)
    });
});


