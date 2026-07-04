export const round = (value: number) => Math.round(value * 100) / 100;
export const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export const interpolate = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  const progress = (value - inMin) / (inMax - inMin);
  return outMin + progress * (outMax - outMin);
};
