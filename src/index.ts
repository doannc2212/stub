import { Hono } from "hono";
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
  const userIdCookie = getCookie(c, "userId");
  if (!userIdCookie) return c.json({});
  const data = await c.req.json<TModel>();
  create(userIdCookie, data);
  return c.json({
    user: userIdCookie,
    ...data,
  });
});

app.post("/clear", (c) => {
  const userIdCookie = getCookie(c, "userId");
  if (!userIdCookie) return c.json({});
  clear(userIdCookie);
  return c.json({ cookie: userIdCookie });
});

app.all("/api/*", async (c) => {
  const userIdCookie = getCookie(c, "userId");
  if (!userIdCookie) return c.json({});
  const path = c.req.path.replace("/api", "");
  const redisData = await get(userIdCookie, c.req.method, path);
  if (!redisData) return c.json({});
  const { status, data } = JSON.parse(redisData);
  c.status = status;
  return c.json(data);
});

export default app;
