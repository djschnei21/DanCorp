import { describe, expect, it } from "vitest";
import { assetPath } from "./asset";

describe("assetPath", () => {
  it("keeps a public path when no Pages base is configured", () => {
    expect(assetPath("/brand/emblem.png")).toBe("/brand/emblem.png");
  });
});
