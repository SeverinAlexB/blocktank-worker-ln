const { BlocktankDatabase } = require('blocktank-worker2')
const entities = require(process.cwd() + '/src/2_database/entities/index')

const config = {
    entities: entities.default,
    debug: false,
    type: 'mongo',
    // clientUrl: 'mongodb://0.0.0.0:27017/blocktank-worker-ln',
  };


global.beforeAll(async () => {
    // await BlocktankDatabase.connect(config)
    await BlocktankDatabase.connectInMemory(config)
});

global.afterEach(async () => {
    // await BlocktankDatabase.cleanDatabase()
});

global.afterAll(async () => {
    await BlocktankDatabase.close()
});