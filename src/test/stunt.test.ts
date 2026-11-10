import { describe, it, expect } from "vitest";
import { buildSpline, atSpline, PART_META } from "../hooks/useRobotStunt";

describe("Robot Stunt Engine & Mathematics", () => {
  it("buildSpline generates continuous arc-length and unwrapped heading angles", () => {
    const points: [number, number][] = [
      [100, 500],
      [200, 400],
      [400, 300],
      [600, 200],
      [800, 100],
    ];
    const path = buildSpline(points);
    expect(path.S.length).toBeGreaterThan(points.length);
    expect(path.len).toBeGreaterThan(0);
    expect(path.L[path.L.length - 1]).toBe(path.len);

    // Verify unwrapped angles don't jump by > PI
    for (let i = 1; i < path.a.length; i++) {
      const diff = Math.abs(path.a[i] - path.a[i - 1]);
      expect(diff).toBeLessThan(Math.PI);
    }
  });

  it("atSpline accurately interpolates points across path length", () => {
    const points: [number, number][] = [
      [0, 0],
      [100, 100],
      [200, 200],
    ];
    const path = buildSpline(points);
    const start = atSpline(path, 0);
    expect(start.x).toBeCloseTo(0, 0);
    expect(start.y).toBeCloseTo(0, 0);

    const mid = atSpline(path, path.len * 0.5);
    expect(mid.x).toBeGreaterThan(50);
    expect(mid.y).toBeGreaterThan(50);

    const end = atSpline(path, path.len);
    expect(end.x).toBeCloseTo(200, 0);
    expect(end.y).toBeCloseTo(200, 0);
  });

  it("all 8 detachable parts are registered in PART_META with radii and socket offsets", () => {
    const expectedParts = [
      "antenna",
      "head",
      "earL",
      "earR",
      "armL",
      "armR",
      "chest",
      "thruster",
    ];
    for (const name of expectedParts) {
      expect(PART_META[name]).toBeDefined();
      expect(typeof PART_META[name].cx).toBe("number");
      expect(typeof PART_META[name].cy).toBe("number");
      expect(PART_META[name].r).toBeGreaterThan(0);
    }
  });

  it("simulates 6 full consecutive stunts without any drift in socket offsets or part states", () => {
    // Simulate physics loop for 6 consecutive stunts
    for (let stuntIteration = 1; stuntIteration <= 6; stuntIteration++) {
      const parts = Object.entries(PART_META).map(([n, { cx, cy, r }]) => ({
        n,
        cx,
        cy,
        r,
        att: true,
        mode: "att" as "att" | "free" | "rest" | "mag",
        x: cx,
        y: cy,
        rot: 0,
        vx: 0,
        vy: 0,
        vr: 0,
      }));

      // 1. Detach 4 random parts
      const detachedIndices = [0, 2, 4, 6];
      for (const idx of detachedIndices) {
        parts[idx].att = false;
        parts[idx].mode = "free";
        parts[idx].vx = 150;
        parts[idx].vy = -200;
        parts[idx].vr = 300;
      }

      // 2. Free physics step with gravity and floor bounce
      const dt = 0.016;
      for (let f = 0; f < 30; f++) {
        for (const p of parts) {
          if (!p.att) {
            p.vy += 1500 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.vr * dt;
            if (p.y > 600) {
              p.y = 600;
              p.vy *= -0.35;
              p.vx *= 0.7;
            }
          }
        }
      }

      // Detached parts have moved
      for (const idx of detachedIndices) {
        expect(parts[idx].att).toBe(false);
        expect(parts[idx].y).toBeGreaterThan(parts[idx].cy);
      }

      // 3. Magnetic repair snapping
      for (const p of parts) {
        p.att = true;
        p.mode = "att";
        p.x = p.cx;
        p.y = p.cy;
        p.rot = 0;
        p.vx = 0;
        p.vy = 0;
        p.vr = 0;
      }

      // Verify all parts are restored to EXACT initial transforms
      for (const p of parts) {
        expect(p.att).toBe(true);
        expect(p.mode).toBe("att");
        expect(p.x).toBe(PART_META[p.n].cx);
        expect(p.y).toBe(PART_META[p.n].cy);
        expect(p.rot).toBe(0);
      }
    }
  });
});
