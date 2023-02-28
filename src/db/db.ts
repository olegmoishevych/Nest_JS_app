import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();
const mongoUri = process.env.mongoURI || process.env.MONGO_URL;

if (!mongoUri) {
  throw new Error('URL didnt found');
}

export const runDb = async () => {
  try {
    await mongoose.connect(mongoUri, { dbName: 'bloggers' });
    console.log('Connected successfully');
  } catch {
    console.log('! Not to connect to server');
    await mongoose.disconnect();
  }
};
