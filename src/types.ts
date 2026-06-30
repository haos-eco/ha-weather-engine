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

export type Timeline = {
    from: Phase
    to: Phase
    progress: number
}

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

export type Background = {
    fromSrc: string
    toSrc: string
}

export type Moon = {
    opacity: number
}

export type Stars = {
    opacity: number
}

export type Scene = {
    phase: Phase
    timeline: Timeline
    weather: WeatherScene
    background: Background
    sun: SunPosition
    moon: Moon
    stars: Stars
}

