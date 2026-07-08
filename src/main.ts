import "./ha/WeatherSceneCard";

import type { Hass, Simulation, WeatherSceneElement } from "./types";

const simulations: Simulation[] = [
  {
    label: "Sunrise dry",
    elevation: 1,
    azimuth: 82,
    weather: "sunny",
    windSpeed: 4,
    windSpeedUnit: "km/h",
  },
  {
    label: "Morning dry",
    elevation: 16,
    azimuth: 115,
    weather: "sunny",
    windSpeed: 8,
    windSpeedUnit: "km/h",
  },
  {
    label: "Midday dry",
    elevation: 55,
    azimuth: 180,
    weather: "sunny",
    windSpeed: 12,
    windSpeedUnit: "km/h",
  },
  {
    label: "Afternoon cloudy",
    elevation: 30,
    azimuth: 235,
    weather: "cloudy",
    windSpeed: 18,
    windSpeedUnit: "km/h",
  },
  {
    label: "Sunset dry",
    elevation: 4,
    azimuth: 278,
    weather: "sunny",
    windSpeed: 10,
    windSpeedUnit: "km/h",
  },
  {
    label: "Dusk wet",
    elevation: -3,
    azimuth: 292,
    weather: "rainy",
    windSpeed: 16,
    windSpeedUnit: "km/h",
  },
  {
    label: "Night clear",
    elevation: -12,
    azimuth: 310,
    weather: "clear-night",
    windSpeed: 6,
    windSpeedUnit: "km/h",
  },
  {
    label: "Midnight storm",
    elevation: -35,
    azimuth: 0,
    weather: "lightning-rainy",
    windSpeed: 34,
    windSpeedUnit: "km/h",
  },
  {
    label: "Deepnight dry",
    elevation: -55,
    azimuth: 0,
    weather: "clear-night",
    windSpeed: 2,
    windSpeedUnit: "km/h",
  },
];

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error(
    'Missing #app element. Add <div id="app"></div> to index.html.',
  );
}

setupPageStyles(app);

const card = document.createElement(
  "weather-scene-card",
) as WeatherSceneElement;

card.setConfig({
  sun_entity: "sun.sun",
  weather_entity: "weather.home",
  /**
   * Vite dev:
   * public/weather/... is served as /weather/...
   *
   * Home Assistant:
   * use /local/weather-scene
   */
  asset_base: "",
});

app.appendChild(card);

const debugPanel = createDebugPanel();
const controls = createControls();

document.body.appendChild(controls);

let currentIndex = 0;
let autoplayTimer: number | undefined;

function createFakeHass(simulation: Simulation): Hass {
  return {
    states: {
      "sun.sun": {
        state: simulation.elevation > 0 ? "above_horizon" : "below_horizon",
        attributes: {
          elevation: simulation.elevation,
          azimuth: simulation.azimuth,
        },
      },

      "weather.home": {
        state: simulation.weather,
        attributes: {
          wind_speed: simulation.windSpeed ?? 0,
          wind_speed_unit: simulation.windSpeedUnit ?? "km/h",
        },
      },

      /**
       * Keep these around for later if you wire them into the card.
       * Harmless now, useful later. Rarely does YAML give us that luxury.
       */
      "sensor.weather_scene_rain_intensity": {
        state: getFakeRainIntensity(simulation.weather),
        attributes: {},
      },

      "sensor.weather_scene_wind_intensity": {
        state: getFakeWindIntensity(simulation.windSpeed ?? 0),
        attributes: {
          wind_speed: simulation.windSpeed ?? 0,
          wind_speed_unit: simulation.windSpeedUnit ?? "km/h",
        },
      },
    },
  };
}

function applySimulation(simulation: Simulation) {
  const hass = createFakeHass(simulation);

  card.hass = hass;

  debugPanel.textContent = JSON.stringify(
    {
      simulation,
      localAssetExamples: {
        background: "/weather/backgrounds/midday/dry.webp",
        sun: "/weather/celestial/sun.webp",
        moon: "/weather/celestial/moon.webp",
        starsA: "/weather/celestial/stars-a.webp",
        dog: "/weather/dog/awake/day-dog.webm",
        cat: "/weather/cat/awake/day-cat.webm",
        rainLight: "/weather/effects/rain/light.webm",
        rainHeavy: "/weather/effects/rain/heavy.webm",
      },
    },
    null,
    2,
  );

  console.clear();
  console.log("Weather scene simulation", simulation);
  console.log("Fake hass", hass);
}

function showDebugPanel() {
    const debugShown = document.body.querySelector('.debug-panel')
    if (debugShown) {
        document.body.removeChild(debugPanel)
        return
    }

    document.body.appendChild(debugPanel);
}

function nextSimulation() {
  currentIndex = (currentIndex + 1) % simulations.length;
  applySimulation(simulations[currentIndex]);
}

function previousSimulation() {
  currentIndex = (currentIndex - 1 + simulations.length) % simulations.length;
  applySimulation(simulations[currentIndex]);
}

function startAutoplay() {
  stopAutoplay();

  autoplayTimer = window.setInterval(() => {
    nextSimulation();
  }, 4000);
}

function stopAutoplay() {
  if (autoplayTimer) {
    window.clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  }
}

function createControls() {
  const wrapper = document.createElement("div");

  wrapper.style.position = "fixed";
  wrapper.style.right = "16px";
  wrapper.style.bottom = "16px";
  wrapper.style.zIndex = "10000";
  wrapper.style.display = "flex";
  wrapper.style.gap = "8px";
  wrapper.style.padding = "10px";
  wrapper.style.borderRadius = "14px";
  wrapper.style.background = "rgba(0, 0, 0, 0.5)";
  wrapper.style.backdropFilter = "blur(12px)";

  const debugPanel = createButton("Show Debug Panel", showDebugPanel);
  const previousButton = createButton("Prev", previousSimulation);
  const nextButton = createButton("Next", nextSimulation);
  const playButton = createButton("Play", startAutoplay);
  const stopButton = createButton("Stop", stopAutoplay);

  wrapper.append(debugPanel, previousButton, nextButton, playButton, stopButton);

  return wrapper;
}

function createButton(label: string, onClick: () => void) {
  const button = document.createElement("button");

  button.textContent = label;
  button.type = "button";

  button.style.border = "0";
  button.style.borderRadius = "10px";
  button.style.padding = "9px 12px";
  button.style.background = "rgba(255, 255, 255, 0.18)";
  button.style.color = "white";
  button.style.cursor = "pointer";
  button.style.font = "13px system-ui, sans-serif";

  button.addEventListener("click", onClick);

  return button;
}

function createDebugPanel() {
  const panel = document.createElement("pre");

  panel.style.position = "fixed";
  panel.style.left = "16px";
  panel.style.bottom = "16px";
  panel.style.zIndex = "10000";
  panel.style.maxWidth = "460px";
  panel.style.maxHeight = "45vh";
  panel.style.overflow = "auto";
  panel.style.margin = "0";
  panel.style.padding = "14px 16px";
  panel.style.borderRadius = "14px";
  panel.style.background = "rgba(0, 0, 0, 0.55)";
  panel.style.backdropFilter = "blur(12px)";
  panel.style.color = "white";
  panel.style.font =
    "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  panel.style.lineHeight = "1.45";
  panel.style.pointerEvents = "none";
  panel.classList.add('debug-panel')

  return panel;
}

function setupPageStyles(root: HTMLElement) {
  document.documentElement.style.width = "100%";
  document.documentElement.style.height = "100%";

  document.body.style.width = "100%";
  document.body.style.height = "100%";
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.style.background = "#000";

  root.style.width = "100vw";
  root.style.height = "100vh";
  root.style.overflow = "hidden";
}

function getFakeRainIntensity(weather: string) {
  const normalized = weather.toLowerCase();

  if (normalized === "pouring" || normalized === "lightning-rainy") {
    return "heavy";
  }

  if (normalized === "rainy") {
    return "medium";
  }

  return "none";
}

function getFakeWindIntensity(speedKmh: number) {
  if (speedKmh >= 30) return "heavy";
  if (speedKmh >= 15) return "medium";
  if (speedKmh >= 5) return "light";

  return "none";
}

window.weatherSceneDebug = {
  card,
  simulations,
  applySimulation,
  next: nextSimulation,
  previous: previousSimulation,
  play: startAutoplay,
  stop: stopAutoplay,
  set(partialSimulation: Partial<Simulation>) {
    const current = simulations[currentIndex];

    applySimulation({
      ...current,
      ...partialSimulation,
      label: partialSimulation.label ?? "Manual debug",
    });
  },
};

applySimulation(simulations[currentIndex]);
