import { Bolt11Invoice } from "./Bolt11Invoice.entity";
import { Bolt11Payment } from "./Bolt11Payment.entity";
import { OpenChannelOrder } from "./OpenChannelOrder.entity";


// Define all entities here
const entities = [
    Bolt11Invoice,
    OpenChannelOrder,
    Bolt11Payment,
]

export default entities