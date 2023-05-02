import { EntityRepository } from '@mikro-orm/mongodb'; // or any other driver package
import { OpenChannelOrder } from '../entities/OpenChannelOrder.entity';
import { OpenChannelOrderState } from '../entities/OpenChannelOrderState';


export class OpenChannelOrderRepository extends EntityRepository<OpenChannelOrder> {
    async getAllOpenOrPending() {
        return this.find({ state: { $in: [OpenChannelOrderState.OPEN, OpenChannelOrderState.OPENING] } })
    }

    async getByTx(txId: string, txVout: number): Promise<OpenChannelOrder | null> {
        return this.findOne({ txId, txVout })
    }
}