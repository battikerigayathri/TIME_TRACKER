import { add } from "../../src/temp/Add";

describe("temp test cases", () => {
  it("should add", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("should throw error if type is string", () => {
    expect(add("1", "2")).toBe(3);
  });

  it("should divide x if >= 100", () => {
    expect(add(100, 1)).toBe(51);
  });
});
