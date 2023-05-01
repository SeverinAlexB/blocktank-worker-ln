const { BlocktankDatabase } = require('blocktank-worker2')
const entities = require(process.cwd() + '/src/2_database/entities/index')

const config = {
    entities: entities.default,
    debug: false,
    type: 'mongo',
  };


global.beforeAll(async () => {
    await BlocktankDatabase.connectInMemory(config)
});

global.afterEach(async () => {
    await BlocktankDatabase.cleanDatabase()
});

global.afterAll(async () => {
    await BlocktankDatabase.close()
});