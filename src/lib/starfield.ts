export const STAR_DATA = Array.from({ length: 200 }, (_, i) => ({
  x:          (i * 73.856 + i * i * 0.137) % 100,
  y:          (i * 47.932 + i * i * 0.089) % 100,
  size:       [1, 1, 1, 1, 1.5, 1.5, 2][i % 7] as number,
  minOpacity: 0.06 + (i % 5) * 0.04,
  maxOpacity: 0.3  + (i % 4) * 0.2,
  twinkle:    i % 4 === 0,
  drift:      i % 9 === 0,
  dur:        2 + (i % 5),
  delay:      (i * 0.71) % 6,
}));

export const SHOOTING_STARS = [
  { x: 8,  y: 6,  angle: 42, delay: 0,  dur: 14 },
  { x: 62, y: 4,  angle: 38, delay: 8,  dur: 20 },
  { x: 30, y: 2,  angle: 50, delay: 17, dur: 16 },
  { x: 80, y: 10, angle: 35, delay: 26, dur: 22 },
];
