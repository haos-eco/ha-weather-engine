import type {
  Hass,
  Phase,
  Scene,
  WeatherSceneCardConfig,
  WeatherSceneElements,
  WeatherVariant,
} from "../types";

import { SceneEngine } from "../engine/SceneEngine";

import backgroundCss from "../assets/css/background.css?inline";
import skyCss from "../assets/css/sky.css?inline";
import celestialCss from "../assets/css/celestial.css?inline";
import effectsCss from "../assets/css/effects.css?inline";

const styles = `
  ${backgroundCss}
  ${skyCss}
  ${celestialCss}
  ${effectsCss}
`;

const DEFAULT_CONFIG: Required<WeatherSceneCardConfig> = {
  sun_entity: "sun.sun",
  weather_entity: "weather.home",
  outdoor_lights_entity: "",
  asset_base: "/local/weather-scene",
  asset_version: "1",
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
    if (!this.elements) this.mount();

    const sunEntity = hass.states[this.config.sun_entity];
    const weatherEntity = hass.states[this.config.weather_entity];
    const outdoorLightsEntity = hass.states[this.config.outdoor_lights_entity];

    const elevation = Number(sunEntity?.attributes?.elevation ?? 0);
    const azimuth = Number(sunEntity?.attributes?.azimuth ?? 180);
    const weather = String(weatherEntity?.state ?? "sunny");
    const outdoorLights = outdoorLightsEntity?.state?.trim().toLowerCase();
      const outdoorLightsOn =
          outdoorLights === "on" ||
          outdoorLights === "true" ||
          outdoorLights === "home" ||
          Number(outdoorLights) > 0;

      const scene = SceneEngine.create({
      elevation,
      azimuth,
      weather,
      outdoorLightsOn,
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
        <div class="stars">
          <img class="stars-layer stars-layer-a" alt="" />
          <img class="stars-layer stars-layer-b" alt="" />
          <img class="stars-layer stars-layer-c" alt="" />
        </div>  
        

        <!-- clouds -->
        <!--<video
          autoplay
          loop
          muted
          playsinline
          class="clouds-overlay"
        >
          <source type="video/webm" />
        </video>-->

        <!-- foreground -->
        <img
          class="background background-a"
          alt=""
        />
        <img
          class="background background-b"
          alt=""
        />
        
        <!-- lamp light passes -->
        <img class="lamp-pass lamp-bloom" alt="" />
        <img class="lamp-pass lamp-spill" alt="" />
        
        <!-- vegetation -->
       <!-- <video
          autoplay
          loop
          muted
          playsinline
          class="vegetation bush"
        >
          <source type="video/webm" />
        </video>-->

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
        
        <!-- weather and phases overlays -->
        <img
          class="scene-effect phase-effect"
          alt=""
          decoding="async"
        />
        
        <img
          class="scene-effect weather-effect"
          alt=""
          decoding="async"
        />
        
        <!-- warm wash over pets/floor -->
        <img class="lamp-pass lamp-wash" alt="" />

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
      starsA: this.getElement<HTMLImageElement>(".stars-layer-a"),
      starsB: this.getElement<HTMLImageElement>(".stars-layer-b"),
      starsC: this.getElement<HTMLImageElement>(".stars-layer-c"),
      // clouds: this.getElement<HTMLVideoElement>(".clouds-overlay"),
      // bush: this.getElement<HTMLVideoElement>(".bush"),
      dog: this.getElement<HTMLVideoElement>(".dog"),
      cat: this.getElement<HTMLVideoElement>(".cat"),
      phaseEffect: this.getElement<HTMLImageElement>(".phase-effect"),
      weatherEffect: this.getElement<HTMLImageElement>(".weather-effect"),
      lampBloom: this.getElement<HTMLImageElement>(".lamp-bloom"),
      lampSpill: this.getElement<HTMLImageElement>(".lamp-spill"),
      lampWash: this.getElement<HTMLImageElement>(".lamp-wash"),
      rain: this.getElement<HTMLVideoElement>(".rain-overlay"),
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
      sun: `${scene.sun.y}-${scene.sun.x}`,
      moonOpacity: scene.moon.opacity,
      starsOpacity: scene.stars.opacity,
      outdoorLightsOn: scene.outdoorLightsOn,
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
      starsA,
      starsB,
      starsC,
      /* clouds,*/
      /*bush,*/
      dog,
      cat,
      phaseEffect,
      weatherEffect,
      rain,
      lampBloom,
      lampSpill,
      lampWash,
    } = this.elements;

    root.className = [
      "scene",
      `phase-${scene.phase}`,
      `weather-${scene.weather.variant}`,
      scene.outdoorLightsOn ? "lamp-on" : "",
    ].join(" ");

    root.dataset.phase = scene.phase;
    root.dataset.weather = scene.weather.variant;

    skyA.className = `sky sky-a ${scene.timeline.from}`;
    skyB.className = `sky sky-b ${scene.timeline.to}`;

    skyA.style.opacity = String(1 - progress);
    skyB.style.opacity = String(progress);

    this.setImageSource(bgFrom, scene.background.fromSrc);
    this.setImageSource(bgTo, scene.background.toSrc);

    bgFrom.style.opacity = String(1 - progress);
    bgTo.style.opacity = String(progress);

    this.setEffectImageSource(
      phaseEffect,
      this.getPhaseEffectSrc(scene),
      this.getPhaseEffectOpacity(scene),
    );

    this.setEffectImageSource(
      weatherEffect,
      this.getWeatherEffectSrc(scene),
      this.getWeatherEffectOpacity(scene),
    );

    sun.style.left = `${scene.sun.x}%`;
    sun.style.top = `${scene.sun.y}%`;
    sun.style.opacity = String(scene.sun.opacity ?? 1 - scene.moon.opacity);
    sun.style.setProperty("--sun-scale", String(scene.sun.scale));

    moon.style.opacity = String(scene.moon.opacity);
    stars.style.opacity = String(scene.stars.opacity);
    this.setImageSource(starsA, "weather/celestial/stars-a.webp");
    this.setImageSource(starsB, "weather/celestial/stars-b.webp");
    this.setImageSource(starsC, "weather/celestial/stars-c.webp");

    this.setImageSource(lampBloom, "weather/effects/lamp/lamp-bloom.webp");
    this.setImageSource(lampSpill, "weather/effects/lamp/lamp-spill.webp");
    this.setImageSource(lampWash, "weather/effects/lamp/lamp-wash.webp");

    this.setBackgroundImage(moon, "weather/celestial/moon.webp");
    /*this.setVideoSource(clouds, this.getCloudsSrc(scene));*/
    /*this.setVideoSource(bush, this.getBushSrc(scene));*/
    this.setVideoSource(dog, this.getDogSrc(scene));
    this.setVideoSource(cat, this.getCatSrc(scene));
    this.setVideoSource(rain, this.getRainSrc(scene));
  }

  private asset(src: string) {
    const url =
      src.startsWith("/") || src.startsWith("http")
        ? src
        : `${this.config.asset_base}/${src}`;

    const version = this.config.asset_version;
    if (!version) return url;

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${encodeURIComponent(version)}`;
  }

  private setBackgroundImage(element: HTMLElement, src: string | null) {
    if (!src) {
      element.style.backgroundImage = "none";
      return;
    }

    element.style.backgroundImage = `url("${this.asset(src)}")`;
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

  private setImageSource(image: HTMLImageElement, src: string | null) {
    if (!src) {
      if (image.hasAttribute("src")) {
        image.removeAttribute("src");
      }

      return;
    }

    const nextSrc = this.asset(src);

    if (image.getAttribute("src") === nextSrc) {
      return;
    }

    image.src = nextSrc;
  }

  private setEffectImageSource(
    image: HTMLImageElement,
    src: string | null,
    opacity: number,
  ) {
    if (!src) {
      image.style.opacity = "0";
      image.removeAttribute("src");
      return;
    }

    this.setImageSource(image, src);
    image.style.opacity = String(opacity);
  }

  private getPhaseEffectSrc(scene: Scene) {
    const phase = scene.phase;
    const phases = new Set([
      "sunrise",
      "afternoon",
      "sunset",
      "dusk",
      "night",
      "midnight",
      "deepnight",
    ]);

    if (!phases.has(phase)) return null;

    return `weather/effects/phase/` + `${phase}.webp`;
  }

  private getWeatherEffectSrc(scene: Scene) {
    const variant = scene.weather.variant;
    const variants = new Set(["cloudy", "wet", "fog", "storm"]);

    if (!variants.has(variant)) return null;

    return `weather/effects/weather/` + `${variant}.webp`;
  }

  private getPhaseEffectOpacity(scene: Scene) {
    const phases = {
      sunrise: 0.16,
      morning: 0,
      midday: 0,
      afternoon: 0.08,
      sunset: 0.2,
      dusk: 0.24,
      night: 0.26,
      midnight: 0.42,
      deepnight: 0.32,
    } satisfies Record<Phase, number>;

    return phases[scene.phase] || 0;
  }

  private getWeatherEffectOpacity(scene: Scene) {
    const weather = {
      dry: 0,
      cloudy: 0.18,
      wet: 0.24,
      fog: 0.28,
      storm: 0.34,
    } satisfies Record<WeatherVariant, number>;

    return weather[scene.weather.variant] || 0;
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

  /*private getBushSrc(scene: Scene) {
    const light = this.getLightPhase(scene);

    if (light !== "night") return `weather/vegetation/day-bush-light.webm`;

    return `weather/vegetation/night-bush-light.webm`;
  }*/

  private getDogSrc(scene: Scene) {
    const weather = scene.weather;
    const light = this.getLightPhase(scene);

    if (weather.isStormy || weather.isRainy) return null;
    if (light !== "day") return `weather/dog/sleeping/${light}-dog.webm`;

    return `weather/dog/awake/day-dog.webm`;
  }

  private getCatSrc(scene: Scene) {
    const weather = scene.weather;
    const light = this.getLightPhase(scene);

    if (weather.isStormy || weather.isRainy) return null;

    if (light !== "day") return `weather/cat/sleeping/${light}-cat.webm`;

    return `weather/cat/awake/day-cat.webm`;
  }

  private getLightPhase(scene: Scene) {
    const phase = scene.phase;

    if (["dusk", "night", "midnight", "deepnight"].includes(phase)) {
      return "night";
    }

    if (["sunrise", "sunset"].includes(phase)) return "golden";
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
