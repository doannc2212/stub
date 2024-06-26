import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
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

const app = new Hono();
app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
  }),
);

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

app.post("/create", async (c) => {
  const userId = getCookie(c, "userId");
  if (!userId) return c.text("No userId");
  const data = await c.req.json<TModel>();
  create(userId, data);
  return c.json({
    user: userId,
    ...data,
  });
});

app.post("/clear", (c) => {
  const userId = getCookie(c, "userId");
  if (!userId) return c.text("No userId");
  clear(userId);
  return c.json({ cookie: userId });
});

app.all("/api/*", async (c) => {
  const userId = getCookie(c, "userId");
  if (!userId) return c.text("No userId");
  const path = c.req.path.replace("/api", "");
  const redisData = await get(userId, c.req.method, path);
  if (!redisData) return c.json({});
  const { status, data } = JSON.parse(redisData);
  return c.json(data, status);
});

const PORT = process.env.PORT || 8000;

export default {
  port: PORT,
  fetch: app.fetch,
};
