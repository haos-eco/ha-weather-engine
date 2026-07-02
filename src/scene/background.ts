import type { Phase, WeatherVariant } from '../types'

const BASE_PATH = 'weather/backgrounds'

export const getBackgroundSrc = (phase: Phase, weather: WeatherVariant) =>
    `${BASE_PATH}/${phase}/${weather}.png`