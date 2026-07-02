import type { WeatherScene, WeatherVariant } from "../types.ts";

export const getWeatherScene = (weather: string): WeatherScene => {
    const isWindy = ['windy', 'windy-variant'].includes(weather)
    const isCloudy = ['cloudy', 'partlycloudy'].includes(weather)
    const isRainy = ['rainy', 'pouring', 'lightning-rainy'].includes(weather)
    const isStormy = ['lightning', 'lightning-rainy'].includes(weather)
    const isFoggy = weather === 'fog'

    let variant: WeatherVariant = 'dry'

    if (isStormy) variant = 'storm'
    else if (isFoggy) variant = 'fog'
    else if (isRainy) variant = 'wet'
    else if (isCloudy) variant = 'cloudy'

    return {
        variant,
        isWindy,
        isCloudy,
        isRainy,
        isStormy,
        isFoggy,
    }
}