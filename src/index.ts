import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});
client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

type TModel = {
  path: string;
  method: string;
  data: object;
  status: number;
};

const app = new Elysia();

const create = (userId: string, value: TModel) => {
  client.set(
    `${userId}:${value.method}:${value.path}`,
    JSON.stringify({ status: value.status, data: value.data }),
  );
};

const clear = async (userId: string) => {
  for await (const key of client.scanIterator({
    TYPE: "string",
    MATCH: `${userId}:*`,
  })) {
    client.del(key);
  }
};

const get = (
  userId: string,
  method: string,
  path: string,
): ReturnType<typeof client.get> => {
  return client.get(`${userId}:${method}:${path}`);
};

app.post("/create", async ({ body, cookie }) => {
  const userId = cookie.userId.value;
  if (!userId) return "No userId";
  if (!(body instanceof Object)) return "Error";
  const data = body as TModel;
  create(userId, data);
  return {
    user: userId,
    ...data,
  };
});

app.post("/clear", ({ cookie }) => {
  const userId = cookie.userId.value;
  if (!userId) return "No userId";
  clear(userId);
  return { cookie: userId };
});

app.all("/api/*", async ({ cookie, path, request: { method }, set }) => {
  const userId = cookie.userId.value;
  if (!userId) return "No userId";
  const redisData = await get(userId, method, path.replace("/api", ""));
  if (!redisData) return {};
  const { status, data } = JSON.parse(redisData);
  set.status = status;
  return data;
});

const PORT = Bun.env.PORT || 8000;
app.use(cors()).listen(PORT);

export default app;
