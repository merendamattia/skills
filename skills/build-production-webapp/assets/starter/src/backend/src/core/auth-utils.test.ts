import { expect, test } from "bun:test";
import { internalEmail } from "./auth-utils.ts";

test("normalizes the bootstrap username into a non-routable email", () => {
  expect(internalEmail("Local.Admin")).toBe("local.admin@production-webapp.internal");
});
