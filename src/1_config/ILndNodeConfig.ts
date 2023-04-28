// {
//     "ln_nodes": [
//       {
//         "certPath": "/Users/severinbuhler/.polar/networks/3/volumes/lnd/alice/tls.cert",
//         "macaroonPath": "/Users/severinbuhler/.polar/networks/3/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon",
//         "grpcSocket": "127.0.0.1:10001",
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