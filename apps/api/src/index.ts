import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./auth";
import { user } from "@devpulse/db/schema";

const app = new Hono();

const PORT = Number(process.env.PORT) || 8000;

app.get("/", async (c) => {
  console.log("Received a request at the root endpoint", user);

  return c.json("sad");
});

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.all("*", (c) => {
  return c.json({ message: "No such endpoint found" }, 404);
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
