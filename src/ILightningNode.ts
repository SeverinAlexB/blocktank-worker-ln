
export interface ILightningNode {
  init(): Promise<void>;

  getInfo(): Promise<any>;

  getInvoice(): Promise<any>;

  getFeeRate(): Promise<any>;

  getOnChainBalance(): Promise<any>;

  createInvoice(memo: string, expiry: Date, amount: number): Promise<any>;

  createHodlInvoice(memo: string, expiry: Date, amount: number): Promise<any>;

  cancelInvoice(id: string): Promise<any>;

  settleHodlInvoice(secret: string): Promise<any>;

  decodePayReq(payReq: string): Promise<any>;

  pay(invoice: string, amount?: number): Promise<any>;

  getForwards(): Promise<any>;

  getPayment(id: string): Promise<any>;

  getSettledPayment(id: string): Promise<any>;

  subscribeToInvoices(): Promise<void>;

  subscribeToPaidInvoices(): Promise<void>;

  subscribeToPayments(): Promise<void>;

  subscribeToForwards(): Promise<void>;

  subscribeToChannelRequests(): Promise<void>;

  subscribeToPeers(): Promise<void>;

  subscribeToTopology(): Promise<void>;

  getNetworkGraph(): Promise<void>;

  openChannel(localAmount: number, remoteAmount: number, targetPubKey: string, isPrivate: boolean):
    Promise<any>;

  closeChannel(id: string): Promise<any>;

  listChannels(): Promise<any>;

  listPeers(): Promise<any>;

  listClosedChannels(): Promise<any>;

  getChannel(id: string): Promise<any>;

  addPeer(url: string): Promise<any>;

  listInvoices(): Promise<any>;

  listPayments(): Promise<any>;
}


