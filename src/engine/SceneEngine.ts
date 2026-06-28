import { getTimeline } from "../scene/timeline.ts";
import { getNightOpacity, getPhase } from "../scene/sky.ts";
import { getSunPosition } from "../scene/celestial.ts";

export class SceneEngine {
  static create({
    elevation,
    azimuth,
    weather,
  }: {
    elevation: number;
    azimuth: number;
    weather: string;
  }) {
    const timeline = getTimeline(elevation, azimuth);
    const phase = getPhase(elevation, azimuth);
    const sun = getSunPosition(elevation, azimuth);
    const night = getNightOpacity(elevation);

    return {
      phase,
      weather,
      timeline,
      sky: {
        filter: "",
      },
      sun,
      moon: {
        opacity: night,
      },
      stars: {
        opacity: night,
      },
    };
  }
}
