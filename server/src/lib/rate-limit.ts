import type { RequestHandler } from 'express';
import type { RedisClientType } from 'redis';

/** Counts hits per key in a fixed window. Redis in prod, in-memory in tests. */
export interface HitCounter {
  hit(key: string, windowSeconds: number): Promise<number>;
}

export function redisHitCounter(redis: RedisClientType): HitCounter {
  return {
    async hit(key, windowSeconds) {
      const [count] = await redis.multi().incr(key).expire(key, windowSeconds, 'NX').exec();
      return Number(count);
    },
  };
}

/** Fixed-window limiter. Fails open if Redis is down, so an outage never blocks the API. */
export function rateLimit(counter: HitCounter, limitPerMinute: number): RequestHandler {
  return async (req, res, next) => {
    const window = Math.floor(Date.now() / 60_000);
    try {
      const hits = await counter.hit(`rl:${req.ip ?? 'unknown'}:${window}`, 60);
      res.setHeader('RateLimit-Remaining', Math.max(0, limitPerMinute - hits));
      if (hits > limitPerMinute) {
        res.status(429).json({ error: 'Too many requests' });
        return;
      }
    } catch (err) {
      console.warn('rate limit skipped:', (err as Error).message);
    }
    next();
  };
}
