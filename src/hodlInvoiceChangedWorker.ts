import { waitOnSigint, RabbitPublisher, BlocktankDatabase } from "blocktank-worker2"
import { LndNodeManager } from "./1_lnd/LndNodeManager"
import dbConfig from './mikro-orm.config'
import { HodlInvoiceWatcher } from "./services/HodlInvoiceWatcher"
import { HodlInvoice } from "./database/entities/HodlInvoice.entity"


// async function createInvoice() {
//     const em = BlocktankDatabase.createEntityManager()
//     const repo = em.getRepository(HodlInvoice)
//     const invoice = await repo.createByNodeAndPersist(1000, 'test', LndNodeManager.nodes[0], 20*1000)
//     await em.flush()
//     console.log(invoice.request)
// }

async function main() {
    const watcher = new HodlInvoiceWatcher()
    try {
        await BlocktankDatabase.connect(dbConfig)
        await LndNodeManager.init()
        // await createInvoice()
        await watcher.watch(LndNodeManager.nodes)

        console.log('Watch invoices.')
        console.log('Configured nodes:\n' + LndNodeManager.description)
        console.log()
        console.log('Press Ctrl+C to exit.')

        await waitOnSigint()
    } catch (e) {
        console.error('Unexpected error.', e)
        throw e
    } finally {
        console.log('Stop watching.')
        await watcher.stop()
        await BlocktankDatabase.close()

    }
}


main().catch(console.error)