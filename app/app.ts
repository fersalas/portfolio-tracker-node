import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  throw dotenvResult.error;
}

import express from 'express';
import * as http from 'http';
import debug from 'debug';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import helmet from 'helmet';

import { CommonRoutesConfig } from './common/common.routes.config';
import { UsersRoutes } from './users/users.routes.config';
import { AuthRoutes } from './auth/auth.routes.config';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const PORT = 8088;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

// parse as JSON middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
// middleware to allow cross-origin requests
app.use(cors());
// security helmet
app.use(helmet());

const loggerOpts: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  )
};

if (!process.env.DEBUG) {
  loggerOpts.meta = false;
  // if (typeof global.it === 'function') {
  //   loggerOpts.level = 'http';
  // }
}

// log HTTP requests
app.use(expressWinston.logger(loggerOpts));

// Routes
routes.push(new AuthRoutes(app));
routes.push(new UsersRoutes(app));

app.get('/', (req: express.Request, res: express.Response) =>
  res.status(200).send('Portfolio Tracker Node Server')
);

server.listen(PORT, () => {
  debugLog(`Server running at http://localhost:${PORT}`);
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });
});
