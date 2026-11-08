const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

(async () => {
  const { createPointMotion, pointOnRoute } = await import('./src/point-motion.mjs');
  const points = [[0, 0], [30, 0], [30, 40]];
  assert.deepEqual(pointOnRoute(points, 0), [0, 0]);
  assert.deepEqual(pointOnRoute(points, 0.5), [30, 5]);
  assert.deepEqual(pointOnRoute(points, 1), [30, 40]);
  const queued = new Map(), painted = [];
  let nextId = 0, clock = 0;
  const controller = createPointMotion({ points, duration: 1000,
    now: () => clock,
    paint: (position, progress) => painted.push({ position, progress }),
    requestFrame: fn => { queued.set(++nextId, fn); return nextId; },
    cancelFrame: id => queued.delete(id) });
  const tick = time => { clock = time; const callbacks = [...queued.values()]; queued.clear(); callbacks.forEach(fn => fn(time)); };
  controller.play(); tick(0); tick(250);
  assert.deepEqual(painted.at(-1).position, [17.5, 0], 'real elapsed time moves the point');
  controller.pause();
  const pausedCount = painted.length;
  tick(5000);
  assert.equal(painted.length, pausedCount, 'paused controller neither paints nor schedules frames');
  assert.equal(queued.size, 0);
  clock = 6000; controller.play(); tick(6000); tick(6250);
  assert.deepEqual(painted.at(-1).position, [30, 5], 'resume continues from the paused position without jumping');
  controller.setDuration(500); tick(6500);
  assert.deepEqual(painted.at(-1).position, [30, 40], 'speed change changes movement rate');
  assert.equal(queued.size, 0, 'a completed trip leaves no animation loop');
  clock = 0;
  const delayed = createPointMotion({ points, duration: 1000, now: () => clock,
    paint: (position, progress) => painted.push({ position, progress }),
    requestFrame: fn => { queued.set(++nextId, fn); return nextId; },
    cancelFrame: id => queued.delete(id) });
  delayed.play(); tick(700);
  assert.equal(painted.at(-1).progress, 0.7, 'a delayed first frame counts time since play');
  clock = 1100; delayed.pause();
  assert.deepEqual(painted.at(-1).position, [30, 40], 'stopping after a dropped frame paints the actual end position');
  assert.equal(queued.size, 0);

  // Exercise the actual application playback function: the last stage gets its own dwell.
  const app = fs.readFileSync('dist/app.js', 'utf8');
  const playFunction = app.slice(app.indexOf('function play(){'), app.indexOf('function finish()'));
  let interval, stops = 0, finishes = 0;
  const states = [];
  const context = { introOpen: false, timer: null, step: 0, speed: 1, motionMode: 'preview', motionVersion: 0, playbackEnded: false,
    frames: () => [0, 1, 2, 3], $: () => ({ setAttribute() {} }), icon: () => '',
    setInterval: fn => { interval = fn; return 1; },
    renderStep: () => states.push(context.step),
    stop: () => { stops++; context.timer = null; context.motionMode = 'paused'; },
    finish: () => finishes++ };
  vm.runInNewContext(playFunction + ';play();', context);
  interval(); interval(); interval();
  assert.deepEqual(states, [0, 1, 2, 3]);
  assert.equal(stops, 0, 'entering final stage must not stop its animation');
  interval();
  assert.equal(stops, 1); assert.equal(finishes, 1);
  assert.equal(context.playbackEnded, true);
  context.introOpen = true;
  vm.runInNewContext('play();', context);
  assert.equal(context.timer, null, 'the guide must not start hidden lesson playback');
  assert.equal(states.length, 4);
  console.log('Motion regression passed: real positions, corners, pause/resume, speed, cleanup, and final-stage dwell.');
})().catch(error => { console.error(error); process.exitCode = 1; });
