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
    expect(getTownStage(29).level).toBe(0);
    expect(getTownStage(30).level).toBe(1);
    expect(getTownStage(80).level).toBe(2);
    expect(getTownStage(150).level).toBe(3);
    expect(getTownStage(250).level).toBe(4);
  });

  it("最大より多くても最大段階のまま", () => {
    expect(getTownStage(9999).level).toBe(4);
  });
});

describe("pointsToNextStage", () => {
  it("次の段階までの残りを返す", () => {
    expect(pointsToNextStage(0)).toBe(30);
    expect(pointsToNextStage(45)).toBe(35);
  });

  it("最大段階なら null", () => {
    expect(pointsToNextStage(250)).toBeNull();
  });
});
