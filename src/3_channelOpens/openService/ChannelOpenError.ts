export class ChannelOpenError extends Error {
    constructor(public message: string, public code: string, public codeNumber: number) {
        super(message)
        this.name = 'ChannelOpenError'
    }
}