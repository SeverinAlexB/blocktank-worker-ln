import {ILndNodeConfig} from '../1_config/ILndNodeConfig'
import { readLndConnectionInfo2 } from '../1_lnd/lndNode/ILndConnectionInfo'
import { LndNode } from '../1_lnd/lndNode/LndNode'
import {LightningWorkerImplementation} from './LightningWorkerImplementation'
import { LndNodeManager } from '../1_lnd/lndNode/LndNodeManager'
import { BlocktankDatabase } from 'blocktank-worker2'
import {sleep} from 'blocktank-worker2/dist/utils';
import { Bolt11Invoice } from '../2_database/entities/Bolt11Invoice.entity'
import { Bolt11InvoiceState } from '../2_database/entities/Bolt11InvoiceState'
import {Bolt11InvoiceWatcher} from '../3_hodlInvoice/Bolt11InvoiceWatcher'

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

describe('WorkerImplementation', () => {

    test('Create invoice', async () => {
        const worker = new LightningWorkerImplementation()
        const invoice = await worker.createHodlInvoice(1000, 'test', 45*1000)
        expect(invoice.createdAt).toBeDefined()
        expect(invoice.state).toEqual('pending')
        expect(invoice.parsedRequest.description).toEqual('test')
        expect(invoice.tokens).toEqual(1000)
    });

    test('Get invoice', async () => {
        const worker = new LightningWorkerImplementation()
        const {paymentHash} = await worker.createHodlInvoice(1000, 'test', 45*1000)
        const invoice = await worker.getHodlInvoice(paymentHash)
        expect(invoice.parsedRequest.description).toEqual('test')
        expect(invoice.tokens).toEqual(1000)
    });

    test('Cancel invoice', async () => {
        const watcher = new Bolt11InvoiceWatcher()
        await watcher.init(LndNodeManager.nodes)
        try {
            const worker = new LightningWorkerImplementation()
            const invoice = await worker.createHodlInvoice(1000, 'test', 45*1000)
            await watcher.listenToInvoice(invoice)
            await worker.cancelHodlInvoice(invoice.paymentHash)

            await sleep(500) // Wait for the watcher to pick up the event
            const repo = BlocktankDatabase.createEntityManager().getRepository(Bolt11Invoice)
            const invoice2 = await repo.findOne({ paymentHash: invoice.paymentHash})
            expect(invoice2?.state).toEqual(Bolt11InvoiceState.CANCELED)
        } finally {
            await watcher.stop()
        }
    });


});


