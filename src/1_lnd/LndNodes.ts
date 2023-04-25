import { LndNode } from "./LndNode";


export class LndNodes {
    constructor(public nodes: LndNode[]) {}

    get random(): LndNode {
        const index = Math.floor(Math.random()*this.nodes.length)
        return this.nodes[index]
    }

    byPublicKey(publicKey: string): LndNode {
        return this.nodes.find(node => node.publicKey === publicKey)
    }
}