import type { Phase } from "../types.ts";

export const getPhase = (elevation: number, azimuth: number): Phase => {
    if (elevation < -32) return 'deepnight'
    if (elevation < -20) return 'midnight'
    if (elevation < -8) return 'night'
    if (elevation < 0) return 'dusk'

    const isAfterNoon = azimuth > 180

    if (elevation < 8) return isAfterNoon ? 'sunset' : 'sunrise'
    if (!isAfterNoon && elevation < 35) return 'morning'
    if (isAfterNoon && elevation < 35) return 'afternoon'

    return 'midday'
}

export const getNightOpacity = (elevation: number)=> {
    if (elevation > -2) return 0
    if (elevation < -18) return 1
    return Math.abs(elevation + 2) / 16
}