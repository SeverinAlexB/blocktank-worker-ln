const { BlocktankDatabase } = require('blocktank-worker2')


global.beforeAll(async () => {
    await BlocktankDatabase.connectInMemory(process.cwd() + '/src/mikro-orm.config.ts')
});

global.afterEach(async () => {
    await BlocktankDatabase.cleanDatabase()
});

global.afterAll(async () => {
    await BlocktankDatabase.close()
});