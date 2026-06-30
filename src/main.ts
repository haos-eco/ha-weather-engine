import "./assets/css/sky.css";
import "./assets/css/weather.css";
import "./assets/css/celestial.css";
import "./assets/css/background.css";
import "./assets/css/debug.css";

import { simulateDay } from "./test";
import { SceneEngine } from "./engine/SceneEngine";

let hour = 6;
let weather = "sunny";
let isPlaying = false;
let interval: number | undefined;

function render() {
  const simulated = simulateDay(hour);

  const scene = SceneEngine.create({
    elevation: simulated.elevation,
    azimuth: simulated.azimuth,
    weather,
  });

  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="scene weather-${scene.weather.variant}">
      <div
        class="sky sky-a ${scene.timeline.from}"
        style="opacity:${1 - scene.timeline.progress};"
      ></div>

      <div
        class="sky sky-b ${scene.timeline.to}"
        style="opacity:${scene.timeline.progress};"
      ></div>

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
    .querySelector<HTMLButtonElement>("#play-toggle")!
    .addEventListener("click", () => {
      isPlaying = !isPlaying;

      if (interval) {
        clearInterval(interval);
        render()
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
