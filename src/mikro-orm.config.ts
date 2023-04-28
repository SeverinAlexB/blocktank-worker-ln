
import { MikroORMOptions, ReflectMetadataProvider } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import entities from './2_database/entities';

const config: Partial<MikroORMOptions<MongoDriver>> = {
  entities: entities,
  clientUrl: 'mongodb://0.0.0.0:27017',
  metadataProvider: ReflectMetadataProvider,
  debug: false,
  type: 'mongo'
};

export default config;