import "./assets/css/weather.css";
import "./assets/css/sky.css";
import "./assets/css/celestial.css";
import "./assets/css/background.css";
import "./assets/css/effects.css";
import "./assets/css/debug.css";

import { simulateDay } from "./test";
import { SceneEngine } from "./engine/SceneEngine";

let hour = 6;
let weather = "sunny";
let clouds = "none";
let effect = "none";
let isPlaying = false;
let interval: number | undefined;

function render() {
  const simulated = simulateDay(hour);

  const scene = SceneEngine.create({
    elevation: simulated.elevation,
    azimuth: simulated.azimuth,
    weather,
  });

  const dog = ["sunrise", "sunset", "dusk"].includes(scene.phase)
    ? "sleeping/golden-dog.webm"
    : ["night", "midnight", "deepnight"].includes(scene.phase)
      ? "sleeping/night-dog.webm"
      : "awake/day-dog.webm";

  const cat = ["sunrise", "sunset", "dusk"].includes(scene.phase)
    ? "sleeping/golden-cat.webm"
    : ["night", "midnight", "deepnight"].includes(scene.phase)
      ? "sleeping/night-cat.webm"
      : "awake/day-cat.webm";

  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="scene weather-${scene.weather.variant}">
      <!-- sky -->
      
      <div
        class="sky sky-a ${scene.timeline.from}"
        style="opacity:${1 - scene.timeline.progress};"
      ></div>

      <div
        class="sky sky-b ${scene.timeline.to}"
        style="opacity:${scene.timeline.progress};"
      ></div>
       
      <!-- celestial -->
      
      <div
        class="sun"
        style="
          left: ${scene.sun.x}%;
          top: ${scene.sun.y}%;
          opacity: ${scene.sun.opacity};
        "
      ></div>

      <div
        class="moon"
        style="opacity: ${scene.moon.opacity};"
      ></div>

      <div
        class="stars"
        style="opacity: ${scene.stars.opacity};"
      ></div>
      
      <!-- clouds -->
      
      <video
          autoplay="${effect !== "none"}"
          loop
          muted
          playsinline
          class="clouds-overlay"
        >
          <source src="/weather/clouds/${clouds}.webm" type="video/webm" />
        </video>
      
       <!-- effects -->
       
       <video
          autoplay="${effect !== "none"}"
          loop
          muted
          playsinline
          class="rain-overlay"
        >
          <source src="/weather/effects/${effect}.webm" type="video/webm" />
        </video>
        
       <!-- dog and cat-->
       
       <video
          autoplay
          loop
          muted
          playsinline
          style="${scene.weather.isRainy || scene.weather.isStormy ? "display: none" : ''}"
          class="animal"
        >
          <source src="/weather/dog/${dog}" type="video/webm" />
        </video>
        
        <video
          autoplay
          loop
          muted
          playsinline
          style="${scene.weather.isRainy || scene.weather.isStormy ? "display: none" : ''}"
          class="animal"
        >
          <source src="/weather/cat/${cat}" type="video/webm" />
        </video>
       
       <!-- foreground -->

      <img
        class="background background-a"
        src="${scene.background.fromSrc}"
        style="opacity: ${1 - scene.timeline.progress};"
        alt=""
      />

      <img
        class="background background-b"
        src="${scene.background.toSrc}"
        style="opacity: ${scene.timeline.progress};"
        alt=""
      />

      <div class="debug">
        <strong>Scene Debug</strong><br>
        hour: ${hour.toFixed(2)}<br>
        phase: ${scene.phase}<br>
        from: ${scene.timeline.from}<br>
        to: ${scene.timeline.to}<br>
        progress: ${scene.timeline.progress.toFixed(2)}<br>
        weather: ${weather}<br>
        variant: ${scene.weather.variant}<br>
        elevation: ${simulated.elevation}<br>
        azimuth: ${simulated.azimuth}<br>

        <input
          id="hour-slider"
          type="range"
          min="0"
          max="24"
          step="0.05"
          value="${hour}"
        />

        <select id="weather-select">
          <option value="sunny" ${weather === "sunny" ? "selected" : ""}>sunny</option>
          <option value="cloudy" ${weather === "cloudy" ? "selected" : ""}>cloudy</option>
          <option value="partlycloudy" ${weather === "partlycloudy" ? "selected" : ""}>partlycloudy</option>
          <option value="rainy" ${weather === "rainy" ? "selected" : ""}>rainy</option>
          <option value="pouring" ${weather === "pouring" ? "selected" : ""}>pouring</option>
          <option value="fog" ${weather === "fog" ? "selected" : ""}>fog</option>
          <option value="lightning" ${weather === "lightning" ? "selected" : ""}>lightning</option>
          <option value="lightning-rainy" ${weather === "lightning-rainy" ? "selected" : ""}>lightning-rainy</option>
          <option value="windy" ${weather === "windy" ? "selected" : ""}>windy</option>
        </select>
        
        <select id="clouds-select">
          <option value="none" ${effect === "none" ? "selected" : ""}>none</option>
          <option value="clouds/day" ${effect === "clouds/day" ? "selected" : ""}>day clouds</option>
          <option value="clouds/golden" ${effect === "clouds/golden" ? "selected" : ""}>golden clouds</option>
          <option value="clouds/night" ${effect === "clouds/night" ? "selected" : ""}>night clouds</option>
          <option value="clouds/storm" ${effect === "clouds/storm" ? "selected" : ""}>storm clouds</option>
        </select>
        
        <select id="effect-select">
          <option value="none" ${effect === "none" ? "selected" : ""}>none</option>
          <option value="rain/light" ${effect === "rain/light" ? "selected" : ""}>light rain</option>
          <option value="rain/medium" ${effect === "rain/medium" ? "selected" : ""}>medium rain</option>
          <option value="rain/heavy" ${effect === "rain/heavy" ? "selected" : ""}>heavy rain</option>
        </select>

        <button id="play-toggle">
          ${isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  `;

  document
    .querySelector<HTMLInputElement>("#hour-slider")!
    .addEventListener("input", (event) => {
      hour = Number((event.target as HTMLInputElement).value);
      render();
    });

  document
    .querySelector<HTMLSelectElement>("#weather-select")!
    .addEventListener("change", (event) => {
      weather = (event.target as HTMLSelectElement).value;
      render();
    });

  document
    .querySelector<HTMLSelectElement>("#effect-select")!
    .addEventListener("change", (event) => {
      effect = (event.target as HTMLSelectElement).value;
      render();
    });

  document
    .querySelector<HTMLButtonElement>("#play-toggle")!
    .addEventListener("click", () => {
      isPlaying = !isPlaying;

      if (interval) {
        clearInterval(interval);
        render();
        return;
      }

      if (isPlaying) {
        interval = setInterval(() => {
          hour += 0.05;
          if (hour > 24) hour = 0;
          render();
        }, 80);
      }
    });
}

render();
