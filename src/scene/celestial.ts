import type { SunPosition } from "../types.ts";

import { clamp } from "../utils.ts";

export const getSunPosition = (elevation: number, azimuth: number): SunPosition => {
    const x = clamp(((azimuth - 90) / 180) * 100, 8, 92)
    const y = clamp(78 - elevation, 8, 88)

    const opacity =
        elevation <= -2 ? 0 :
            elevation < 5 ? elevation / 5 :
                1

    return { x, y, opacity }
}

