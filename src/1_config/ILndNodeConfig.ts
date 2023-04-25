// {
//     "ln_nodes": [
//       {
//         "cert": "/Users/severinbuhler/.polar/networks/3/volumes/lnd/alice/tls.cert",
//         "macaroon": "/Users/severinbuhler/.polar/networks/3/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon",
//         "socket": "127.0.0.1:10001",
//         "node_type": "LND",
//         "node_name": "alice_lnd"
//       }
//     ],
//   }


export interface ILndNodeConfig {
    /**
     * Path to the tls.cert file. Example: /Users/severinbuhler/.polar/networks/3/volumes/lnd/alice/tls.cert
     */
    certPath: string,
    /**
     * Admin macaroon path. Example: /Users/severinbuhler/.polar/networks/3/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon
     */
    macaroonPath: string,
    /**
     * GRPC socket address. Example: 127.0.0.1:10001
     */
    grpcSocket: string,
}