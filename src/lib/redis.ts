import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | null | undefined;
}

const redisUrl = process.env.REDIS_URL;
let redisDisabled = false;
let redisDisableLogged = false;
let redisConnectedLogged = false;

function normalizeRedisUrl(value: string): string {
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `redis://${trimmed}`;
}

function isAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /NOAUTH|WRONGPASS|AUTH/i.test(message);
}

function disableRedis(reason?: unknown): void {
  redisDisabled = true;

  if (global.redisClient) {
    // Close the socket and stop retries for this process; app will gracefully use DB fallback.
    global.redisClient.disconnect(false);
    global.redisClient = null;
  }

  if (!redisDisableLogged) {
    redisDisableLogged = true;
    if (reason instanceof Error) {
      console.warn(`Redis disabled for this process: ${reason.message}`);
    } else if (typeof reason === "string" && reason.length > 0) {
      console.warn(`Redis disabled for this process: ${reason}`);
    } else {
      console.warn("Redis disabled for this process due to connection/auth failure.");
    }
  }
}

function getValidatedRedisUrl(): string | null {
  if (!redisUrl || redisDisabled) {
    return null;
  }

  const normalized = normalizeRedisUrl(redisUrl);

  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname) {
      disableRedis("REDIS_URL is invalid (missing hostname).");
      return null;
    }

    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    if (!isLocalHost && parsed.password.length === 0) {
      disableRedis("REDIS_URL for remote host is missing password.");
      return null;
    }

    return normalized;
  } catch {
    disableRedis("REDIS_URL is not a valid URL.");
    return null;
  }
}

function createClient(): Redis | null {
  if (redisDisabled) {
    return null;
  }

  const validatedRedisUrl = getValidatedRedisUrl();
  if (!validatedRedisUrl) {
    return null;
  }

  if (global.redisClient) {
    return global.redisClient;
  }

  const client = new Redis(validatedRedisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
    retryStrategy: (attempts) => {
      if (redisDisabled || attempts > 2) {
        return null;
      }

      return Math.min(attempts * 100, 500);
    },
  });

  client.on("connect", () => {
    if (process.env.NODE_ENV !== "production" && !redisConnectedLogged) {
      redisConnectedLogged = true;
      console.log("Redis connected");
    }
  });
  client.on("error", (error) => {
    if (isAuthError(error)) {
      disableRedis(error);
      return;
    }

    console.error("Redis error", error);
  });

  global.redisClient = client;
  return client;
}

function getClient(): Redis | null {
  if (redisDisabled) {
    return null;
  }

  return global.redisClient ?? createClient();
}

async function ensureConnection() {
  if (redisDisabled) {
    return null;
  }

  const client = getClient();
  if (!client) {
    return null;
  }

  try {
    if (client.status === "wait") {
      await client.connect();
    }

    return client;
  } catch (error) {
    if (isAuthError(error)) {
      disableRedis(error);
      return null;
    }

    console.error("Redis connect error", error);
    return null;
  }
}

export async function getRedisClient(): Promise<Redis | null> {
  return ensureConnection();
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
    if (isAuthError(error)) {
      disableRedis(error);
      return null;
    }

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
    if (isAuthError(error)) {
      disableRedis(error);
      return;
    }

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
    if (isAuthError(error)) {
      disableRedis(error);
      return;
    }

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
    if (isAuthError(error)) {
      disableRedis(error);
      return;
    }

    console.error(`Redis deleteCachePattern error for pattern: ${pattern}`, error);
  }
}
