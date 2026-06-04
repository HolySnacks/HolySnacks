import { describe, it, expect } from "vitest";
import { computeXP, getLevelInfo, LEVELS } from "@/lib/supabase";

describe("computeXP", () => {
  it("awards base 15 XP for a non-first scan with no streak", () => {
    expect(computeXP(0, false, 0)).toBe(15);
  });

  it("adds score bonus: 1 XP per 100 purity points", () => {
    expect(computeXP(500, false, 0)).toBe(20); // 15 base + 5 score bonus
    expect(computeXP(1000, false, 0)).toBe(25); // 15 + 10
    expect(computeXP(250, false, 0)).toBe(17); // 15 + floor(2.5) = 17
  });

  it("adds 30 XP for the first scan of the day", () => {
    expect(computeXP(0, true, 0)).toBe(45); // 15 + 30
  });

  it("adds streak bonus only on first scan of the day", () => {
    expect(computeXP(0, true, 5)).toBe(95);  // 15 + 30 + 50
    expect(computeXP(0, false, 5)).toBe(15); // streak bonus skipped
  });

  it("combines all bonuses correctly", () => {
    expect(computeXP(700, true, 3)).toBe(15 + 7 + 30 + 30); // 82
  });

  it("never goes negative for a score of 0", () => {
    expect(computeXP(0, false, 0)).toBeGreaterThanOrEqual(0);
  });
});

describe("getLevelInfo", () => {
  it("returns level 1 for 0 XP", () => {
    const info = getLevelInfo(0);
    expect(info.current.level).toBe(1);
    expect(info.current.title).toBe("Snack Curious");
  });

  it("returns level 2 at exactly 300 XP", () => {
    const info = getLevelInfo(300);
    expect(info.current.level).toBe(2);
    expect(info.current.title).toBe("Label Reader");
  });

  it("returns level 10 at max XP", () => {
    const info = getLevelInfo(40000);
    expect(info.current.level).toBe(10);
    expect(info.current.title).toBe("Snack Deity");
    expect(info.progress).toBe(100); // maxed out
  });

  it("calculates progress correctly within a level", () => {
    // Level 1 spans 0–299 XP (range = 300). At 150 XP, progress = 50%
    const info = getLevelInfo(150);
    expect(info.current.level).toBe(1);
    expect(info.progress).toBe(50);
  });

  it("LEVELS array has exactly 10 entries in ascending XP order", () => {
    expect(LEVELS).toHaveLength(10);
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].xpRequired).toBeGreaterThan(LEVELS[i - 1].xpRequired);
    }
  });
});
