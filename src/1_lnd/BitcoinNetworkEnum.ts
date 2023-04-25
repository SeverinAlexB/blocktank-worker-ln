

enum BitcoinNetworkEnum {
    MAINNET='mainnet',
    TESTNET='testnet',
    SIGNET='signet',
    REGTEST='regtest'
}


export function isValidBitcoinNetwork(network: string): boolean {
    const values = Object.values(BitcoinNetworkEnum);
    for (const value of values) {
        if (value.toLowerCase() === network.toLowerCase()) {
            return true
        }
    }
    return false
}

export default BitcoinNetworkEnum