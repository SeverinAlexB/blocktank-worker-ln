import * as invoiceLn from "@node-lightning/invoice"
import { randomBytes } from 'crypto'
import BitcoinNetworkEnum from "./BitcoinNetworkEnum"


const base = 'lnbcrt10u1p3u0se0pp5cm3wqqyem7nc9xrd9cl4rnt0r8889skntm6mht5s656d0t0en8qqdqqcqzpgxqyz5vqsp5hhnn7d57ckla52pawy2wsugtu3zvmk320uh3trzwhxx90ftuujuq9qyyssq3se2e4mm9t4epvh6xjxqm2evtkzxe2sdgrgt749u0khjuaranwzzuyw2svxmyv76as9h8q6tpumvtlnksmrzpcc8emy6d4yqtes206cpxs83u4'

interface CreateInvoiceArgs {
    amountSat: number | null,
    expiresInS: number,
    description: string,
    createdAt: Date
    network: BitcoinNetworkEnum
}

const defaults: CreateInvoiceArgs = {
    amountSat: 1000,
    expiresInS: 10*60,
    description: 'fake invoice',
    createdAt: new Date(),
    network: BitcoinNetworkEnum.REGTEST
}

export default class FakeInvoice {
    static get randomPrivateKey(): Buffer {
        return randomBytes(32)
    }

    private static convertNetwork(network: BitcoinNetworkEnum) {
        switch (network) {
            case BitcoinNetworkEnum.MAINNET: {
                return 'bc'
            };
            case BitcoinNetworkEnum.TESTNET: {
                return 'tb'
            };
            case BitcoinNetworkEnum.SIGNET: {
                return 'tbs'
            };
            case BitcoinNetworkEnum.REGTEST: {
                return 'bcrt'
            };
        }
    }
    /**
     * Creates a fake invoice with a random private key. Used for testing.
     * @param args 
     * @returns 
     */
    static create(args: Partial<CreateInvoiceArgs> = {}): string {
        const args2: CreateInvoiceArgs = Object.assign({},defaults, args)
        const decoded = invoiceLn.decode(base)
        decoded.timestamp = args2.createdAt.getTime()/1000

        if (!args2.amountSat) {
            decoded.valueSat = ''
        }
        else if (Number.isInteger(args2.amountSat)) {
            decoded.valueSat = args2.amountSat.toString()
        } else {
            decoded.valueMsat = (args2.amountSat! * 1000).toString()
        }

        decoded.expiry = args2.expiresInS
        decoded.desc = args2.description
        decoded.network = this.convertNetwork(args2.network)
        return invoiceLn.encode(decoded, this.randomPrivateKey)
    }


}