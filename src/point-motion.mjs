import { pathLength } from './isokit-model.mjs';

export function pointOnRoute(points, progress) {
  let remaining = pathLength(points) * Math.max(0, Math.min(1, progress));
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const distance = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (remaining <= distance && distance > 0) {
      return [a[0] + (b[0] - a[0]) * remaining / distance, a[1] + (b[1] - a[1]) * remaining / distance];
    }
    remaining -= distance;
  }
  return points[points.length - 1];
}

// One visible trip per stage. Elapsed time advances only while playing.
export function createPointMotion({ points, duration, paint, requestFrame, cancelFrame, now = () => performance.now() }) {
  let progress = 0, running = false, pending = null, previous = null;
  const draw = () => paint(pointOnRoute(points, progress), progress);
  function advance(time) {
    if (previous !== null) progress = Math.min(1, progress + Math.max(0, time - previous) / duration);
    previous = time;
    draw();
  }
  function frame(now) {
    pending = null;
    if (!running) return;
    advance(now);
    if (progress < 1) pending = requestFrame(frame);
    else running = false;
  }
  draw();
  return {
    play() {
      if (running || progress >= 1) return;
      running = true; previous = now(); pending = requestFrame(frame);
    },
    pause() {
      if (running) advance(now());
      running = false; previous = null;
      if (pending !== null) cancelFrame(pending);
      pending = null;
    },
    setDuration(ms) {
      if (running) advance(now());
      duration = Math.max(1, ms);
    },
  };
}
