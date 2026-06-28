export type Phase =
    | 'sunrise'
    | 'morning'
    | 'midday'
    | 'afternoon'
    | 'sunset'
    | 'dusk'
    | 'night'
    | 'midnight'
    | 'deepnight'

export type WeatherVariant =
    | 'dry'
    | 'wet'
    | 'cloudy'
    | 'fog'
    | 'storm'

export type WeatherScene = {
    variant: WeatherVariant
    isWindy: boolean
    isRainy: boolean
    isStormy: boolean
    isFoggy: boolean
    isCloudy: boolean
}

export type SunPosition = {
    x: number
    y: number
    opacity: number
}

export type Timeline = {
    from: Phase
    to: Phase
    progress: number
}

export interface Scene {
    phase: Phase
    weather: WeatherVariant
    timeline: {
        from: Phase
        to: Phase
        progress: number
    }
    sky: {
        filter: string
    }
    sun: {
        x: number
        y: number
        opacity: number
    }
    moon: {
        opacity: number
    }
    stars: {
        opacity: number
    }
}