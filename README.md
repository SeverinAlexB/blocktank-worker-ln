# blocktank-worker-ln

Microservice worker to interact with Lightning Network Node


## Use Cases

### HODL invoices

Create an invoice, get notified on payment, and settle/cancel the invoice. Auto-cancels the invoice in case the payment runs into the channel timeout.

### Channel open

Open a channel with a peer. This includes establishing the peer connection. Get notified on success/failure.

### General node info

Get general node information, such as balance, channels, peers, etc.

### Onchain balance monitoring

