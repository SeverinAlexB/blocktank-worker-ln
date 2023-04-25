const { MongoDatabase } = require('blocktank-worker2')


global.beforeAll(async () => {
    await MongoDatabase.connectInMemory()
});

global.afterEach(async () => {
    await MongoDatabase.clearDatabase()
});

global.afterAll(async () => {
    await MongoDatabase.close()
});