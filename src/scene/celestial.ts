import type { Phase, SunPosition } from "../types.ts";

import { clamp, lerp } from "../utils.ts";

export const getSunPosition = (
  elevation: number,
  azimuth: number,
): SunPosition => {
  const x = clamp(((azimuth - 90) / 180) * 100, 8, 92);
  const y = clamp(78 - elevation, 8, 88);

  const opacity = elevation <= -2 ? 0 : elevation < 5 ? elevation / 5 : 1;

  return { x, y, opacity };
};

export const getSunScale = (phase: Phase, elevation: number) => {
  const safeElevation = clamp(elevation, 0, 60);

  /**
   * Sunrise:
   * starts smaller near the horizon, then grows.
   */
  if (phase === "sunrise") {
    const progress = clamp(safeElevation / 10, 0, 1);
    return lerp(0.48, 0.9, progress);
  }

  /**
   * Morning:
   * grows toward normal / slightly bigger.
   */
  if (phase === "morning") {
    const progress = clamp((safeElevation - 8) / 22, 0, 1);
    return lerp(0.9, 1.12, progress);
  }

  /**
   * Midday:
   * biggest sun.
   */
  if (phase === "midday") return 1.8;

  /**
   * Afternoon:
   * starts big, slowly returns toward normal.
   */
  if (phase === "afternoon") {
    const progress = clamp((safeElevation - 12) / 35, 0, 1);
    return lerp(1.02, 1.18, progress);
  }

  /**
   * Sunset:
   * normal size, not tiny.
   */
  if (phase === "sunset") return 1;

  /**
   * Night phases:
   * sun is hidden anyway.
   */
  return 1;
};
