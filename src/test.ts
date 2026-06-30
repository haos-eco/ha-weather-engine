import { interpolate, round } from "./utils.ts";

type SimulatedSun = {
    hour: number
    elevation: number
    azimuth: number
}

export function simulateDay(hour: number): SimulatedSun {
    const sunrise = 6
    const sunset = 20
    const solarNoon = 13

    const azimuth = interpolate(hour, sunrise, sunset, 90, 270)

    let elevation: number

    if (hour < sunrise) {
        elevation = interpolate(hour, 0, sunrise, -42, 0)
    } else if (hour <= solarNoon) {
        elevation = interpolate(hour, sunrise, solarNoon, 0, 62)
    } else if (hour <= sunset) {
        elevation = interpolate(hour, solarNoon, sunset, 62, 0)
    } else {
        elevation = interpolate(hour, sunset, 24, 0, -42)
    }

    return {
        hour,
        elevation: round(elevation),
        azimuth: round(azimuth),
    }
}

