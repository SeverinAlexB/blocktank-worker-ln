

// https://lightningdecoder.com/
import BitcoinNetworkEnum from "./BitcoinNetworkEnum";
import FakeInvoice from "./FakeInvoice";
import isValidLightningInvoice from "./isValidLightningInvoice";

describe('isValidLightningInvoice', () => {

    test('valid', async () => {
        const invoice = FakeInvoice.create()
        const {isValid} = isValidLightningInvoice(invoice)
        expect(isValid).toEqual(true)
    })

    test('wrong network', async () => {
        const invoice = FakeInvoice.create({network: BitcoinNetworkEnum.MAINNET})
        expect(invoice.startsWith('lnbc')).toBeTruthy()
        const {isValid} = isValidLightningInvoice(invoice)
        expect(isValid).toEqual(false)
    })

    test('zero amount', async () => {
        const invoice = FakeInvoice.create({amountSat: null})
        const {isValid} = isValidLightningInvoice(invoice)
        expect(isValid).toEqual(false)
    })

    test('expired', async () => {
        const invoice = FakeInvoice.create({createdAt: new Date('2022-01-01 00:00:00')})
        const {isValid} = isValidLightningInvoice(invoice)
        expect(isValid).toEqual(false)
    })

});
