import { GrenacheClient } from "blocktank-worker2";
import { LndNode } from "./LndNode";
import { Config } from "../../1_config/Config";


const config = Config.get()


export class OnchainBalanceMonitor {
    private isNodeBelow: Map<string, boolean> = new Map()
    public nodes: LndNode[]
    private watchPeriodMs = 30*1000; // 30s
    private alertThresholdSat: number
    private interval: NodeJS.Timer
    private grenacheClient = new GrenacheClient(config.grapeUrl)
    private slackService: any;

    private isFirstRun = true
    async watch(nodes: LndNode[], alertThresholdSat: number) {
        this.grenacheClient.start()
        this.slackService = this.grenacheClient.encapsulateWorker('svc:slack2')
        this.nodes = nodes
        this.alertThresholdSat = alertThresholdSat

        this.watchOnce()
        this.interval = setInterval(() => {
            this.watchOnce()
        }, this.watchPeriodMs)
    }

    async stop() {
        if (this.interval) {
            clearInterval(this.interval)
        }
        this.grenacheClient.stop()
    }

    async watchOnce() {
        for (const node of this.nodes) {
            try {
                const balanceSat = await node.getOnchainBalance()
                const isBelow = balanceSat < this.alertThresholdSat
                const stateChanged = this.isNodeBelow.get(node.publicKey) !== isBelow
                this.isNodeBelow.set(node.publicKey, isBelow)
                if (stateChanged) {
                    await this.onBalanceStateChanged(node, balanceSat)
                }
            } catch(e) {
                console.error('Error getting onchain balance', e)
            }
        }
        this.isFirstRun = false
    }

    private formatSats(satoshi: number): string {
        const btc = satoshi / (100*1000*1000)
        return 'BTC' + btc.toFixed(8)
    }

    private async sendToSlack(level: string, tag: string, message: string) {
        try {
            await this.slackService.sendMessage('blocktankInstant', level, tag, message, undefined)
        } catch (e) {
            console.error('Failed to send slack message.', e)
        }
    }

    private async onBalanceStateChanged(node: LndNode, balanceSat: number) {
        const formatedBtc = this.formatSats(balanceSat)
        if (this.alertThresholdSat > balanceSat) {
            const message = `Onchain balance of node ${node.alias} ${node.publicKey} are below threshold of ${this.formatSats(this.alertThresholdSat)}:  ${formatedBtc}.`
            console.log(message)
            await this.sendToSlack('warning', 'Onchain funds are low.', message)
        } else {
            if (!this.isFirstRun){ // Dont send recovered on watcher startup.
                const message = `Onchain balance of node ${node.alias} ${node.publicKey} recovered to ${formatedBtc}.`
                console.log(message)
                await this.sendToSlack('success', 'Onchain recovered.', message)
            }
        }

    }
}