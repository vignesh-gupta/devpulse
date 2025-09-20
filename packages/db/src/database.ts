import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config"; // Load environment variables from .env file

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
