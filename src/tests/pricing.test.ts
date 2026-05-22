import { describe, expect, it } from "vitest";
import { computeSalePrice } from "../utils/pricing";

describe("computeSalePrice", () => {
  it("prefers explicit lower sale price", () => {
    expect(computeSalePrice(100, 10, 80)).toBe(80);
  });

  it("calculates from sale percent when needed", () => {
    expect(computeSalePrice(100, 15)).toBe(85);
  });
});
