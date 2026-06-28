import './assets/css/sky.css'
import './assets/css/celestial.css'
import './assets/css/debug.css'

import { SceneEngine } from './engine/SceneEngine'
import { simulateDay } from './scene/test'

let hour = 6
let isPlaying = false
let interval: number | undefined

function render() {
    const simulated = simulateDay(hour)

    const scene = SceneEngine.create({
        elevation: simulated.elevation,
        azimuth: simulated.azimuth,
        weather: '',
    })

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="scene">
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
          left:${scene.sun.x}%;
          top:${scene.sun.y}%;
          opacity:${scene.sun.opacity};
        "
      ></div>

      <div
        class="moon"
        style="opacity:${scene.moon.opacity};"
      ></div>

      <div
        class="stars"
        style="opacity:${scene.stars.opacity};"
      ></div>

      <div class="debug">
        <strong>Scene Debug</strong><br>
        hour: ${hour.toFixed(2)}<br>
        phase: ${scene.phase}<br>
        from: ${scene.timeline.from}<br>
        to: ${scene.timeline.to}<br>
        progress: ${scene.timeline.progress.toFixed(2)}<br>
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

        <button id="play-toggle">
          ${isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  `

    document
        .querySelector<HTMLInputElement>('#hour-slider')!
        .addEventListener('input', event => {
            const target = event.target as HTMLInputElement
            hour = Number(target.value)
            render()
        })

    document
        .querySelector<HTMLButtonElement>('#play-toggle')!
        .addEventListener('click', () => {
            isPlaying = !isPlaying

            if (isPlaying) {
                interval = window.setInterval(() => {
                    hour += 0.05

                    if (hour > 24) hour = 0

                    render()
                }, 80)
            } else if (interval) {
                clearInterval(interval)
            }

            render()
        })
}

render()