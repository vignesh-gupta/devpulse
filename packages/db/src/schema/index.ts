export * from "./auth-schema";
export * from "./devpulse-schema";
const schemas = {
  ...require("./auth-schema"),
  ...require("./devpulse-schema"),
};

export default schemas;
