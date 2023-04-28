import { LndNode } from "./LndNode";





export class LndNodeList {
    constructor(public nodes: LndNode[]) {}

    /**
     * Random node from the list.
     */
    get random(): LndNode {
        const index = Math.floor(Math.random()*this.nodes.length)
        return this.nodes[index]
    }

    /**
     * Get node by pubkey
     * @param publicKey 
     * @returns 
     */
    byPublicKey(publicKey: string): LndNode {
        return this.nodes.find(node => node.publicKey === publicKey)
    }

    get description(): string {
        const lines = this.nodes.map(node => {
            return `${node.alias} ${node.publicKey} ${node.version}`
        })
        return lines.join('\n')
    }
}