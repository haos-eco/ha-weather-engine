import type {
  Hass,
  Scene,
  WeatherSceneCardConfig,
  WeatherSceneElements,
} from "../types";

import { SceneEngine } from "../engine/SceneEngine";

import backgroundCss from "../assets/css/background.css?inline";
import skyCss from "../assets/css/sky.css?inline";
import celestialCss from "../assets/css/celestial.css?inline";
import weatherCss from "../assets/css/weather.css?inline";
import effectsCss from "../assets/css/effects.css?inline";

const styles = `
  ${backgroundCss}
  ${skyCss}
  ${celestialCss}
  ${weatherCss}
  ${effectsCss}
`;

const DEFAULT_CONFIG: Required<WeatherSceneCardConfig> = {
  sun_entity: "sun.sun",
  weather_entity: "weather.home",
  asset_base: "/local/weather-scene/assets",
};

class WeatherSceneCard extends HTMLElement {
  private config: Required<WeatherSceneCardConfig> = DEFAULT_CONFIG;
  private shadowRootRef: ShadowRoot;
  private elements?: WeatherSceneElements;
  private lastSceneKey = "";

  constructor() {
    super();
    this.shadowRootRef = this.attachShadow({ mode: "open" });
  }

  setConfig(config: WeatherSceneCardConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.mount();
  }

  set hass(hass: Hass) {
    if (!this.elements) {
      this.mount();
    }

    const sunEntity = hass.states[this.config.sun_entity];
    const weatherEntity = hass.states[this.config.weather_entity];

    const elevation = Number(sunEntity?.attributes?.elevation ?? 0);
    const azimuth = Number(sunEntity?.attributes?.azimuth ?? 180);
    const weather = String(weatherEntity?.state ?? "sunny");

    const scene = SceneEngine.create({
      elevation,
      azimuth,
      weather,
    });

    this.applyScene(scene);
  }

  getCardSize() {
    return 12;
  }

  private mount() {
    this.shadowRootRef.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 100vh;
        }

        ${styles}
      </style>

      <div class="scene">
        <!-- sky -->
        <div class="sky sky-a"></div>
        <div class="sky sky-b"></div>

        <!-- celestial -->
        <div class="sun"></div>
        <div class="moon"></div>
        <div class="stars"></div>

        <!-- clouds -->
        <video
          autoplay
          loop
          muted
          playsinline
          class="clouds-overlay"
        >
          <source type="video/webm" />
        </video>

        <!-- foreground / balcony / city -->
        <img
          class="background background-a"
          alt=""
        />
        <img
          class="background background-b"
          alt=""
        />

        <!-- dog and cat -->
        <video
          autoplay
          loop
          muted
          playsinline
          class="animal dog"
        >
          <source type="video/webm" />
        </video>

        <video
          autoplay
          loop
          muted
          playsinline
          class="animal cat"
        >
          <source type="video/webm" />
        </video>

        <!-- weather effects -->
        <video
          autoplay
          loop
          muted
          playsinline
          class="rain-overlay"
        >
          <source type="video/webm" />
        </video>
      </div>
    `;

    this.elements = {
      root: this.getElement<HTMLDivElement>(".scene"),

      skyA: this.getElement<HTMLDivElement>(".sky-a"),
      skyB: this.getElement<HTMLDivElement>(".sky-b"),

      bgFrom: this.getElement<HTMLImageElement>(".background-a"),
      bgTo: this.getElement<HTMLImageElement>(".background-b"),

      sun: this.getElement<HTMLDivElement>(".sun"),
      moon: this.getElement<HTMLDivElement>(".moon"),
      stars: this.getElement<HTMLDivElement>(".stars"),

      clouds: this.getElement<HTMLVideoElement>(".clouds-overlay"),
      rain: this.getElement<HTMLVideoElement>(".rain-overlay"),

      dog: this.getElement<HTMLVideoElement>(".dog"),
      cat: this.getElement<HTMLVideoElement>(".cat"),
    };
  }

  private getElement<T extends Element>(selector: string): T {
    const element = this.shadowRootRef.querySelector<T>(selector);

    if (!element) {
      throw new Error(`SceneWeatherCard: missing element "${selector}"`);
    }

    return element;
  }

  private applyScene(scene: Scene) {
    if (!this.elements) return;

    const progress = scene.timeline.progress ?? 0;

    const sceneKey = JSON.stringify({
      phase: scene.phase,
      weather: scene.weather.variant,
      from: scene.background.fromSrc,
      to: scene.background.toSrc,
      progress,
      sun: scene.sun,
      moonOpacity: scene.moon.opacity,
      starsOpacity: scene.stars.opacity,
    });

    if (sceneKey === this.lastSceneKey) return;
    this.lastSceneKey = sceneKey;

    const {
      root,
      skyA,
      skyB,
      bgFrom,
      bgTo,
      sun,
      moon,
      stars,
     /* clouds,*/
      rain,
      dog,
      cat,
    } = this.elements;

    root.className = `scene weather-${scene.weather.variant}`;
    root.dataset.phase = scene.phase;
    root.dataset.weather = scene.weather.variant;

    skyA.className = `sky sky-a ${scene.timeline.from}`;
    skyB.className = `sky sky-b ${scene.timeline.to}`;

    skyA.style.opacity = String(1 - progress);
    skyB.style.opacity = String(progress);

    bgFrom.src = this.asset(scene.background.fromSrc);
    bgTo.src = this.asset(scene.background.toSrc);

    bgFrom.style.opacity = String(1 - progress);
    bgTo.style.opacity = String(progress);

    sun.style.left = `${scene.sun.x}%`;
    sun.style.top = `${scene.sun.y}%`;
    sun.style.opacity = String(scene.sun.opacity ?? 1 - scene.moon.opacity);

    moon.style.opacity = String(scene.moon.opacity);
    stars.style.opacity = String(scene.stars.opacity);

    /*this.setVideoSource(clouds, this.getCloudsSrc(scene));*/
    this.setVideoSource(rain, this.getRainSrc(scene));
    this.setVideoSource(dog, this.getDogSrc(scene));
    this.setVideoSource(cat, this.getCatSrc(scene));
  }

  private asset(src: string) {
    if (src.startsWith("/") || src.startsWith("http")) {
      return src;
    }

    return `${this.config.asset_base}/${src}`;
  }

  private setVideoSource(video: HTMLVideoElement, src: string | null) {
    const source = video.querySelector("source");

    if (!source) return;

    if (!src) {
      video.style.opacity = "0";
      video.pause();
      source.removeAttribute("src");
      video.load();
      return;
    }

    const nextSrc = this.asset(src);
    const currentSrc = source.getAttribute("src");

    if (currentSrc === nextSrc) {
      video.style.opacity = "1";

      if (video.paused) {
        void video.play().catch(() => {});
      }

      return;
    }

    source.setAttribute("src", nextSrc);

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.style.opacity = "1";
    video.load();

    void video.play().catch(() => {
      // Muted + playsInline should autoplay, but browsers enjoy petty rebellion.
    });
  }

  /*private getCloudsSrc(scene: Scene) {
    /!*const variant = scene.weather.variant;

    if (variant === "storm") {
      return "weather/clouds/storm.webm";
    }

    if (variant === "cloudy" || variant === "wet" || variant === "fog") {
      return "weather/clouds/cloudy.webm";
    }*!/

    return null;
  }*/

  private getRainSrc(scene: Scene) {
    const variant = scene.weather.variant;

    if (variant === "storm") {
      return "weather/effects/rain/heavy.webm";
    }

    if (variant === "wet") {
      return "weather/effects/rain/light.webm";
    }

    return null;
  }

  private getDogSrc(scene: Scene) {
    const weather = scene.weather.variant;
    const light = this.getLightPhase(scene);

    if (weather === "storm" || weather === "wet") {
      return null;
    }

    if (light !== "day") {
      return `weather/dog/sleeping/${light}-dog.webm`;
    }

    return `weather/dog/awake/day-dog.webm`;
  }

  private getCatSrc(scene: Scene) {
    const weather = scene.weather.variant;
    const light = this.getLightPhase(scene);

    if (weather === "storm" || weather === "wet") {
      return null;
    }

    if (light !== "day") {
      return `weather/cat/sleeping/${light}-cat.webm`;
    }

    return `weather/dog/awake/day-cat.webm`;
  }

  private getLightPhase(scene: Scene) {
    const phase = scene.phase;

    if (phase === "night" || phase === "deepnight" || phase === "midnight") {
      return "night";
    }

    if (
      phase === "sunrise" ||
      phase === "sunset" ||
      phase === "dusk"
    ) {
      return "golden";
    }

    return "day";
  }
}

customElements.define("weather-scene-card", WeatherSceneCard);

window.customCards = window.customCards || [];

window.customCards.push({
  type: "weather-scene-card",
  name: "Weather Scene Card",
  preview: false,
  description:
    "Animated weather scene background driven by sun.sun elevation and azimuth.",
});
