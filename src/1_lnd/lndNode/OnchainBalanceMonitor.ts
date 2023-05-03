import { LndNode } from "./LndNode";

export class OnchainBalanceMonitor {
    public nodes: LndNode[]
    private watchPeriodMs = 30*1000; // 30s
    private alertThresholdSat: number
    private interval: NodeJS.Timer
    async watch(nodes: LndNode[], alertThresholdSat: number) {
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
    }

    async watchOnce() {
        for (const node of this.nodes) {
            try {
                const balanceSat = await node.getOnchainBalance()
                if (balanceSat < this.alertThresholdSat) {
                    await this.onBalanceBelowTreshhold(node, balanceSat)
                }
            } catch(e) {
                console.error('Error getting onchain balance', e)
            }
        }
    }

    private async onBalanceBelowTreshhold(node: LndNode, balanceSat: number) {
        console.log(`Onchain balance of node ${node.alias} ${node.publicKey} is below threshold of ${this.alertThresholdSat.toLocaleString()}sat:  ${balanceSat.toLocaleString()}sat.`)

    }
}