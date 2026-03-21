import mongoose from "mongoose";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);

    cached.promise = mongoose
      .connect(uri)
      .then((connection) => {
        console.log("MongoDB connected");
        return connection;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("MongoDB connection error", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
