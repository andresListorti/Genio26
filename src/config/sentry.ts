import * as Sentry from '@sentry/node';
import { env } from './env';

Sentry.init({
  dsn: env.sentry.dsn,
  environment: env.nodeEnv,
  enabled: Boolean(env.sentry.dsn),
  tracesSampleRate: env.nodeEnv === 'production' ? 0.2 : 1.0,
});

export { Sentry };
