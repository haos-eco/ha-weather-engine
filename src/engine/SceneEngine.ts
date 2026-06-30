import type { Scene } from "../types.ts";

import { getPhase, getNightOpacity } from "../scene/sky";
import { getBackgroundSrc } from "../scene/background";
import { getSunPosition } from "../scene/celestial";
import { getWeatherScene } from "../scene/weather";
import { getTimeline } from "../scene/timeline";

export class SceneEngine {
  static create({
    elevation,
    azimuth,
    weather,
  }: {
    elevation: number;
    azimuth: number;
    weather: string;
  }): Scene {
    const phase = getPhase(elevation, azimuth);
    const timeline = getTimeline(elevation, azimuth);
    const weatherScene = getWeatherScene(weather);
    const sun = getSunPosition(elevation, azimuth);
    const night = getNightOpacity(elevation);

    return {
      phase,
      timeline,
      weather: weatherScene,
      background: {
        fromSrc: getBackgroundSrc(timeline.from, weatherScene.variant),
        toSrc: getBackgroundSrc(timeline.to, weatherScene.variant),
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
