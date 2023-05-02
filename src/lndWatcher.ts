import { waitOnSigint, BlocktankDatabase } from "blocktank-worker2"
import dbConfig from './mikro-orm.config'
import { HodlInvoiceWatcher } from "./3_hodlInvoice/HodlInvoiceWatcher"
import { LndNodeManager } from "./1_lnd/lndNode/LndNodeManager"
import { OpenChannelWatcher } from "./3_channelOpens/OpenChannelWatcher"



/**
 * Worker that watches HodlInvoices on LND, updates our database and publishes events to rabbitMq.
 */
async function main() {
    const watcher = new HodlInvoiceWatcher()
    const channelWatcher = new OpenChannelWatcher()
    try {
        await BlocktankDatabase.connect(dbConfig)
        await LndNodeManager.init()
        await watcher.watch(LndNodeManager.nodes)
        await channelWatcher.watch(LndNodeManager.nodes)

        console.log('Watch events from the lightning nodes.')
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
        await channelWatcher.stop()
        await BlocktankDatabase.close()
        process.exit(0)
    }
}


main().catch(console.error)