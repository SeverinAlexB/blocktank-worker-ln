export enum LndPaymentFailureEnum {
    INSUFFICIENT_LOCAL_BALANCE = 'INSUFFICIENT_LOCAL_BALANCE',
    PATHFINDING_TIMEOUT = 'PATHFINDING_TIMEOUT',
    PAYMENT_REJECTED_BY_DESTINATION = 'PAYMENT_REJECTED_BY_DESTINATION',
    ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND'
}

export function interferLndPaymentFailure(failure: any): LndPaymentFailureEnum {
    if (failure.is_insufficient_balance) {
        return LndPaymentFailureEnum.INSUFFICIENT_LOCAL_BALANCE
    } else if (failure.is_pathfinding_timeout) {
        return LndPaymentFailureEnum.PATHFINDING_TIMEOUT
    } else if (failure.is_invalid_payment) {
        return LndPaymentFailureEnum.PAYMENT_REJECTED_BY_DESTINATION
    } else if (failure.is_route_not_found) {
        return LndPaymentFailureEnum.ROUTE_NOT_FOUND
    } else {
        throw new Error('Unknow error state ' + JSON.stringify(failure))
    }
}