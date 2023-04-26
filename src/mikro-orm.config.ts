
import { MikroORMOptions, ReflectMetadataProvider } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';

const config: Partial<MikroORMOptions<MongoDriver>> = {
  entities: ['dist/database/entities/**/*.entity.ts'],
  entitiesTs: ['src/database/entities/**/*.entity.ts'],
  clientUrl: 'mongodb://0.0.0.0:27017',
  metadataProvider: ReflectMetadataProvider,
  debug: false,
  type: 'mongo'
};

export default config;