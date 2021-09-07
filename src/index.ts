// * ======== Required Modules ======== * //
import * as dotenv from 'dotenv';
dotenv.config();
import config from 'config';
import Debug from 'debug';
import Express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// * ======== App Variables ======== * //
if (!config.has('Server.port')) {
  console.log('Port not specified');
  process.exit(1);
}
const PORT: number = 8080;
const app = Express();
const debug = Debug('app:main');

// * ======== Middleware ======== * //
app.use(helmet());
app.use(cors());
app.use(Express.json());
app.use(compression());

// * ======== Routers ======== * //
import dataRouter from './routes/data.router';

// * ======== Routes ======== * //
app.use('/api/data', dataRouter);

// * ======== Fire Server  ======== * //
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
