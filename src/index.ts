import { Sentry } from './config/sentry';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import './config/firebase';
import apiRoutes from './routes';
import webhookRoutes from './routes/webhook.routes';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/error.middleware';

const app = express();

app.use(cors());

app.use(
  '/webhooks',
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  }),
  webhookRoutes,
);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'Zapateria Genaro API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(
    `Zapateria Genaro API listening on http://localhost:${env.port} (${env.nodeEnv})`,
  );
});
