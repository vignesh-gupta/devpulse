import { customAlphabet } from "nanoid";

// Create a custom nanoid generator with URL-safe characters
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  21
);

export function generateId(prefix?: string): string {
  const id = nanoid();
  return prefix ? `${prefix}_${id}` : id;
}

// Specific ID generators for different entities
export const createId = {
  user: () => generateId("usr"),
  repository: () => generateId("repo"),
  token: () => generateId("token"),
  activity: () => generateId("activity"),
  summary: () => generateId("summary"),
  session: () => generateId("session"),
  account: () => generateId("account"),
  verification: () => generateId("verify"),
};