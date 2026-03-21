import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | null | undefined;
}

const redisUrl = process.env.REDIS_URL;

function createClient(): Redis | null {
  if (!redisUrl) {
    return null;
  }

  if (global.redisClient) {
    return global.redisClient;
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
  });

  client.on("connect", () => console.log("Redis connected"));
  client.on("error", (error) => console.error("Redis error", error));

  global.redisClient = client;
  return client;
}

export const redis = createClient();

async function ensureConnection() {
  if (!redis) {
    return null;
  }

  try {
    if (redis.status === "wait") {
      await redis.connect();
    }

    return redis;
  } catch (error) {
    console.error("Redis connect error", error);
    return null;
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = await ensureConnection();
  if (!client) {
    return null;
  }

  try {
    const raw = await client.get(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Redis getCache error for key: ${key}`, error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = await ensureConnection();
  if (!client) {
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.error(`Redis setCache error for key: ${key}`, error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  const client = await ensureConnection();
  if (!client) {
    return;
  }

  try {
    await client.del(key);
  } catch (error) {
    console.error(`Redis deleteCache error for key: ${key}`, error);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = await ensureConnection();
  if (!client) {
    return;
  }

  try {
    let cursor = "0";

    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    console.error(`Redis deleteCachePattern error for pattern: ${pattern}`, error);
  }
}
