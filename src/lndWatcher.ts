import { waitOnSigint, BlocktankDatabase } from "blocktank-worker2"
import dbConfig from './mikro-orm.config'
import { Bolt11InvoiceWatcher } from "./3_hodlInvoice/Bolt11InvoiceWatcher"
import { LndNodeManager } from "./1_lnd/lndNode/LndNodeManager"
import { OpenChannelWatcher } from "./3_channelOpens/OpenChannelWatcher"
import { OnchainBalanceMonitor } from "./3_balanceMonitor/OnchainBalanceMonitor"
import { AppConfig } from "./1_config/Config"
import { Bolt11PayWatcher } from "./3_payments/Bolt11PayWatcher"


const config = AppConfig.get()
/**
 * Worker that watches HodlInvoices on LND, updates our database and publishes events to rabbitMq.
 */
async function main() {
    const watcher = new Bolt11InvoiceWatcher()
    const channelWatcher = new OpenChannelWatcher()
    const balanceMonitor = new OnchainBalanceMonitor()
    const paymentWatcher = new Bolt11PayWatcher()
    try {
        await BlocktankDatabase.connect(dbConfig)
        await LndNodeManager.init()
        await watcher.watch(LndNodeManager.nodes)
        await channelWatcher.watch(LndNodeManager.nodes)
        await balanceMonitor.watch(LndNodeManager.nodes, config.alertOnchainBalanceThresholdSat)
        await paymentWatcher.watch(LndNodeManager.nodes)

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
        await balanceMonitor.stop()
        await BlocktankDatabase.close()
        await paymentWatcher.stop()
        process.exit(0)
    }
}


main().catch(console.error)