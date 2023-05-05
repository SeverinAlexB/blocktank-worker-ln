import { BlocktankDatabase } from "blocktank-worker2";
import { Bolt11Payment } from "../2_database/entities/Bolt11Payment.entity";
import { LndNode } from "../1_lnd/lndNode/LndNode";

export class Bolt11PayService {
    static async pay(request: string, node: LndNode, maxFeePpm: number): Promise<void> {
        const repo = BlocktankDatabase.orm.em.fork().getRepository(Bolt11Payment)
        const pay = await repo.createByNodeAndPersist(request, node)
        node.pay(pay.request, {maxFeePpm: maxFeePpm}) // Fire and forget; We will get notified of the result via subscriptions.
        
    }
}