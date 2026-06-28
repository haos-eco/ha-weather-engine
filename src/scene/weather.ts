import type { WeatherScene, WeatherVariant } from "../types.ts";

export const getWeatherScene = (weather: string): WeatherScene => {
    const isStormy = ['lightning', 'lightning-rainy'].includes(weather)
    const isRainy = ['rainy', 'pouring', 'lightning-rainy'].includes(weather)
    const isFoggy = weather === 'fog'
    const isWindy = ['windy', 'windy-variant'].includes(weather)
    const isCloudy = ['cloudy', 'partlycloudy', 'windy', 'windy-variant'].includes(weather)

    let variant: WeatherVariant = 'dry'

    if (isStormy) variant = 'storm'
    else if (isFoggy) variant = 'fog'
    else if (isRainy) variant = 'wet'
    else if (isCloudy) variant = 'cloudy'

    return {
        variant,
        isWindy,
        isRainy,
        isStormy,
        isFoggy,
        isCloudy,
    }
}