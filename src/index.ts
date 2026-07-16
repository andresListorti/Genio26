import { Sentry } from './config/sentry';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env';
import './config/firebase';
import apiRoutes from './routes';
import webhookRoutes from './routes/webhook.routes';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/error.middleware';

const app = express();

// Render (and most PaaS) sit behind a single reverse proxy hop — trust it so
// express-rate-limit and req.ip see the real client IP instead of the proxy's.
app.set('trust proxy', 1);

app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigins,
  }),
);

// Applies only to /api — webhooks are server-to-server (PayPal/Mercado Pago),
// not browser traffic, and PayPal/MP retry on failure, so they're excluded to
// avoid dropping legitimate payment notifications under load.
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

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

app.use('/api', apiRateLimit, apiRoutes);

app.use(notFoundHandler);
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(
    `Zapateria Genaro API listening on http://localhost:${env.port} (${env.nodeEnv})`,
  );
});
