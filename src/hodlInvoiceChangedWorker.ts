import { waitOnSigint, BlocktankDatabase } from "blocktank-worker2"
import dbConfig from './mikro-orm.config'
import { HodlInvoiceWatcher } from "./worker/HodlInvoiceWatcher"
import { LndNodeManager } from "./1_lnd/lndNode/LndNodeManager"



/**
 * Worker that watches HodlInvoices on LND, updates our database and publishes events to rabbitMq.
 */
async function main() {
    const watcher = new HodlInvoiceWatcher()
    try {
        await BlocktankDatabase.connect(dbConfig)
        await LndNodeManager.init()
        await watcher.watch(LndNodeManager.nodes)

        console.log('Watch hodl invoices.')
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