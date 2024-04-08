import { describe, expect, it } from "bun:test";
import app from "../src";

const PORT = Bun.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

describe("Create mock data", () => {
  it("No userId", async () => {
    const response = await app
      .handle(new Request(`${baseURL}/create`, { method: "POST" }))
      .then((res) => res.text());

    expect(response).toBe("No userId");
  });

  it("Success", async () => {
    const response = await app
      .handle(
        new Request(`${baseURL}/create`, {
          method: "POST",
          headers: { cookie: "userId=doannc; Path=/;" },
        })
      )
      .then((res) => res.text());
    const expected = JSON.stringify({ user: "doannc" });

    expect(response).toBe(expected);
  });
});
