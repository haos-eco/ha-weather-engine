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

export type Background = {
    fromSrc: string
    toSrc: string
}

export type SunPosition = {
    x: number
    y: number
    opacity: number
}

export type Sun = {
    scale?: number
} & SunPosition

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
    sun: Sun
    moon: Moon
    stars: Stars
}

export type HassState = {
    state: string;
    attributes: Record<string, unknown>;
};

export type Hass = {
    states: Record<string, HassState>;
};

export type WeatherSceneCardConfig = {
    sun_entity?: string;
    weather_entity?: string;
    asset_base?: string;
    asset_version?: string;
};

export type WeatherSceneElements = {
    root: HTMLDivElement;
    skyA: HTMLDivElement;
    skyB: HTMLDivElement;
    bgFrom: HTMLImageElement;
    bgTo: HTMLImageElement;
    sun: HTMLDivElement;
    moon: HTMLDivElement;
    stars: HTMLDivElement;
    starsA: HTMLImageElement;
    starsB: HTMLImageElement;
    starsC: HTMLImageElement;
    clouds: HTMLVideoElement;
    rain: HTMLVideoElement;
    dog: HTMLVideoElement;
    cat: HTMLVideoElement;
};

export type WeatherSceneElement = HTMLElement & {
    setConfig: (config: WeatherSceneCardConfig) => void;
    hass: Hass;
};

export type Simulation = {
    label: string;
    elevation: number;
    azimuth: number;
    weather: string;
    windSpeed?: number;
    windSpeedUnit?: string;
};
