import { expect, test } from "bun:test";
import { dateTime } from "./format.ts";

test("formats a valid timestamp", () => {
  expect(dateTime("2026-08-05T12:00:00Z")).toBeTruthy();
});
