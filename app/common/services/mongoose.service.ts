import mongoose from 'mongoose';
import debug from 'debug';

const DB_URL = 'mongodb://localhost:27017/portfolio-tracker-db';
const log: debug.IDebugger = debug('app:mongoose-service');

class MongooseService {
  private static instance: MongooseService;

  options = {
    autoIndex: false,
    poolSize: 10,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  count = 0;

  constructor() {
    this.connectWithRetry();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new MongooseService();
    }
    return this.instance;
  }

  getMongoose() {
    return mongoose;
  }

  connectWithRetry() {
    log('MongoDB connection with retry');
    mongoose
      .connect(DB_URL, this.options)
      .then(() => {
        log('MongoDB is connected');
      })
      .catch((err) => {
        log('MongoDB connection failed, retry after 5 seconds', ++this.count);
        setTimeout(this.connectWithRetry, 5000);
      });
  }
}

export default MongooseService.getInstance();
