# blocktank-worker-ln

Microservice worker to interact with Lightning Network Node


## APIs

### HODL invoices

* `createHodlInvoice(amountSat: number, description: string, expiresInMs: number = 60*60*1000): Promise<HodlInvoice>`
    * amountSat: amount in satoshis.
    * description: description of the invoice.
    * expiresInMs: time in milliseconds until the invoice expires. Default 1 hour.
    * Returns HodlInvoice object.

* `cancelHodlInvoice(paymentHash: string): Promise<void>`
    * paymentHash: payment hash of the invoice to cancel.

* `settleHodlInvoice(paymentHash: string): Promise<void>`
    * paymentHash: payment hash of the invoice to settle.

* `getHodlInvoice(paymentHash: string): Promise<HodlInvoice>`
    * paymentHash: payment hash of the invoice to get.
    * Returns HodlInvoice object.

#### Events

The event `svc:ln2`.`invoiceChanged` will notify when an invoice state changes. The event data is of type `IInvoiceStateChangedEvent`.
The most important event is `HodlInvoiceState.HOLDING`. It indicates that the invoice has been paid but the payment has not been settled yet. You need to either call `settleHodlInvoice` (to settle the invoice) or `cancelHodlInvoice` (to refund the payment).

```typescript
export enum HodlInvoiceState {
    PENDING = 'pending', // Expect payment
    HOLDING = 'holding', // Payment received but not confirmed/rejected yet
    PAID = 'paid', // Payment confirmed
    CANCELED = 'canceled', // Payment rejected or invoice expired.
}

export interface IInvoiceStateChangedEvent {
    paymentHash: string,
    state: {
        old: HodlInvoiceState,
        new: HodlInvoiceState
    },
    updatedAt: Date
}
```

### Channel open

Open a channel with a peer. This includes establishing the peer connection.

* `orderChannel(connectionString: string, isPrivate: boolean, localBalanceSat: number, pushBalanceSat: number = 0): Promise<OpenChannelOrder>`
    * connectionString: connection string of the peer to open the channel with. pubkey@host:port
    * isPrivate: whether the channel should be private or not.
    * localBalanceSat: amount of satoshis to commit to the channel.
    * pushBalanceSat: amount of satoshis to push to the peer. Default 0.
    * Returns OpenChannelOrder object.

* `getOrderedChannel(id: string): Promise<OpenChannelOrder>`
    * id: id of the order to get.
    * Returns OpenChannelOrder object.

#### Events

The event `svc:ln2`.`channelChanged` will notify when a channel order state changes. The event data is of type `IChannelUpdateEvent`.


```typescript
export enum OpenChannelOrderState {
    OPENING = 'opening',
    OPEN = 'open',
    CLOSED = 'closed',
}

export interface IChannelUpdateEvent {
    orderId: string,
    state: {
        old: OpenChannelOrderState,
        new: OpenChannelOrderState
    },
    updatedAt: Date
}
```

### General node info

Get general node information, such as balance, channels, peers, etc.

### Onchain balance monitoring

