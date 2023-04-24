import {ILndNodeConfig} from '../config/ILndNodeConfig'
import {readLndConnectionInfo2} from './ILndConnectionInfo'
import {LndNode} from './LndNode'

describe('LndNode', () => {
    test('config read', async () => {
        const config: ILndNodeConfig = {
            grpcSocket: '127.0.0.1:10001',
            certPath: '/Users/severinbuhler/.polar/networks/3/volumes/lnd/alice/tls.cert',
            macaroonPath: '/Users/severinbuhler/.polar/networks/3/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon'
        }

        const connectionInfo = readLndConnectionInfo2(config)
        const node = new LndNode(connectionInfo)
        await node.connect()
        
        expect(node.alias).toBeDefined()
        expect(node.publicKey).toBeDefined()
        expect(node.connectionStrings).toBeDefined()
        expect(node.version).toBeDefined()
    });
});


