import { describe, expect, it } from "vitest";
import { addPoints, getTownStage, pointsToNextStage } from "./game";

describe("addPoints", () => {
  it("ポイントを足せる", () => {
    expect(addPoints(0, 10)).toBe(10);
    expect(addPoints(25, 10)).toBe(35);
  });

  it("0 より小さくならない", () => {
    expect(addPoints(5, -100)).toBe(0);
  });
});

describe("getTownStage", () => {
  it("0 pt はあれ地", () => {
    expect(getTownStage(0).name).toBe("あれ地");
  });

  it("ちょうど境目の値で次の段階になる", () => {
    expect(getTownStage(9).level).toBe(0);
    expect(getTownStage(10).level).toBe(1);
    expect(getTownStage(30).level).toBe(2);
  });

  it("最大より多くても最大段階のまま", () => {
    expect(getTownStage(9999).level).toBe(4);
  });
});

describe("pointsToNextStage", () => {
  it("次の段階までの残りを返す", () => {
    expect(pointsToNextStage(0)).toBe(10);
    expect(pointsToNextStage(15)).toBe(15);
  });

  it("最大段階なら null", () => {
    expect(pointsToNextStage(100)).toBeNull();
  });
});
