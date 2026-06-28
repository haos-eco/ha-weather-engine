import type { Timeline } from '../types.ts'

import { clamp } from "../utils.ts";

export const getTimeline = (elevation: number, azimuth: number): Timeline => {
    const isAfterNoon = azimuth > 180

    const dayStops = isAfterNoon
        ? [
            { phase: 'midday' as const, value: 50 },
            { phase: 'afternoon' as const, value: 30 },
            { phase: 'sunset' as const, value: 4 },
            { phase: 'dusk' as const, value: -2 },
            { phase: 'night' as const, value: -12 },
            { phase: 'midnight' as const, value: -25 },
            { phase: 'deepnight' as const, value: -40 },
        ]
        : [
            { phase: 'deepnight' as const, value: -40 },
            { phase: 'midnight' as const, value: -25 },
            { phase: 'night' as const, value: -12 },
            { phase: 'dusk' as const, value: -2 },
            { phase: 'sunrise' as const, value: 4 },
            { phase: 'morning' as const, value: 20 },
            { phase: 'midday' as const, value: 50 },
        ]

    for (let i = 0; i < dayStops.length - 1; i++) {
        const current = dayStops[i]
        const next = dayStops[i + 1]

        const min = Math.min(current.value, next.value)
        const max = Math.max(current.value, next.value)

        if (elevation >= min && elevation <= max) {
            const progress =
                current.value < next.value
                    ? (elevation - current.value) / (next.value - current.value)
                    : (current.value - elevation) / (current.value - next.value)

            return {
                from: current.phase,
                to: next.phase,
                progress: clamp(progress, 0, 1),
            }
        }
    }

    const fallback = elevation > 0 ? 'midday' : 'deepnight'

    return {
        from: fallback,
        to: fallback,
        progress: 0,
    }
}