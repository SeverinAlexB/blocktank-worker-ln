
import { AppConfig } from "../../1_config/Config";
import { readLndConnectionInfo2 } from "./ILndConnectionInfo";
import { LndNode } from "./LndNode";


const config = AppConfig.get();

/**
 * Static class that provides access to all configured nodes. Main entrypoint for other classes to get the nodes from.
 */
export class LndNodeManager {
    static nodes: LndNode[];

    /**
     * Connects to all configured nodes.
     */
    static async init() {
        const nodes = config.nodes.map(nodeConfig => {
            const options = readLndConnectionInfo2(nodeConfig)
            const node = new LndNode(options)
            return node
        })
        for (const node of nodes) {
            try {
                await node.connect()
            } catch(e) {
                console.error('Could not connect to node with rpc', node.options.grpcSocketUrl)
                throw e
            }

        }
        this.nodes = nodes
    }

    /**
     * Random node from the list.
     */
    static get random(): LndNode {
        const index = Math.floor(Math.random()*this.nodes.length)
        return this.nodes[index]
    }

    /**
     * Get node by pubkey
     * @param publicKey 
     * @returns 
     */
    static byPublicKey(publicKey: string): LndNode {
        return this.nodes.find(node => node.publicKey === publicKey)
    }

    /**
     * Returns a multi line description of the configured nodes.
     */
    static get description(): string {
        const lines = this.nodes.map(node => {
            return `${node.alias} ${node.publicKey} ${node.version}`
        })
        return lines.join('\n')
    }
}