import { createAuth } from '@keystone-next/auth';
import {config, createSchema} from '@keystone-next/keystone/schema';
import 'dotenv/config';
import { User } from './schemas/User';
import {withItemData, statelessSessions} from '@keystone-next/keystone/session';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost:3000';

const sesssionConfig = {
  maxAge: 60 * 60 * 24 * 360,
  secret: process.env.COOKIE_SECRET,
}

const {withAuth} = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password',]
  }
})

export default withAuth(config({
  server: {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    },
  },
  db: {
    adapter: 'mongoose',
    url: databaseURL,
    async onConnect(keystone) {
      if(process.argv.includes('--seed-data')){
        await insertSeedData(keystone);
      }
    },
  },
  lists: createSchema({
    User,
    Product,
    ProductImage
  }),
  ui: {
    isAccessAllowed: ({session}) => {
      return session?.data;
    },
  },
  session: withItemData(statelessSessions(sesssionConfig), {
    User: 'id'
  })
}));