const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

(async () => {
  const { routeBetween, truncateRoute, pathLength, toWorld, labelLines } = await import('./src/isokit-model.mjs');
  const { project } = await import('react-isokit');
  fs.mkdirSync('.openai/local', { recursive: true });
  buildSync({ entryPoints: ['src/isokit-scene.jsx'], outfile: '.openai/local/scene.cjs',
    bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime'], define: { 'process.env.NODE_ENV': '"production"' } });
  const { MechanismScene } = require('./.openai/local/scene.cjs');
  const scope = {};
  vm.runInNewContext(fs.readFileSync('dist/data.js', 'utf8') + ';this.lessons=LESSONS;', scope);
  let stages = 0;
  for (const lesson of scope.lessons) for (const [caseName, scene] of [['main', lesson], ['alternate', lesson.fault]]) {
    for (const name of scene.nodes) assert(labelLines(name).length <= 2, 'node label must fit two readable lines: ' + name);
    for (const [stage, frame] of scene.steps.entries()) {
      const id = `${lesson.id}:${caseName}:${stage}`, kind = frame[6];
      const props = { label: id, nodes: scene.nodes, frame, playing: true, speed: 1, stageKey: id, dark: false, reducedMotion: false };
      const html = renderToStaticMarkup(React.createElement(MechanismScene, props));
      assert(html.includes('data-renderer="react-isokit"'), id + ' uses the real library');
      assert.equal((html.match(/data-node="/g) || []).length, 4, id + ' participants');
      assert.equal((html.match(/class="iso-body"/g) || []).length, 4, id + ' Box models');
      assert.equal(html.includes('id="active-path"'), kind !== 'local', id + ' local operations have no transfer');
      assert.equal(/marker-end="/.test(html), !['local', 'compare'].includes(kind), id + ' arrow meaning');
      assert.equal(html.includes('class="flow-particle iso-travel-dot"'), ['request', 'data'].includes(kind), id + ' only actual transfers have moving points');
      const paused = renderToStaticMarkup(React.createElement(MechanismScene, { ...props, playing: false }));
      if (['request', 'data'].includes(kind)) assert(paused.includes('data-motion="paused"'), id + ' pause holds the point');
      const reduced = renderToStaticMarkup(React.createElement(MechanismScene, { ...props, reducedMotion: true }));
      assert(!reduced.includes('class="flow-particle iso-travel-dot"'), id + ' respects reduced motion');
      const route = routeBetween(frame[1], frame[2]);
      if (route) {
        for (const point of route) {
          const back = project(...toWorld(point));
          assert(Math.abs(back[0] - point[0]) < 0.001 && Math.abs(back[1] - point[1]) < 0.001, id + ' projection preserves endpoints');
        }
        if (kind === 'lost') {
          assert(Math.abs(pathLength(truncateRoute(route)) - pathLength(route) / 2) < 0.001, id + ' message stops halfway');
          assert.equal((html.match(/node-current/g) || []).length, 1, id + ' receiving node is not active');
        }
      }
      stages++;
    }
  }
  // All participant pairs use the clear central corridor, avoiding unrelated modules and labels.
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if (a !== b) {
    const route = routeBetween(a, b);
    for (let i = 1; i < route.length; i++) assert(route[i][0] === route[i - 1][0] || route[i][1] === route[i - 1][1], 'routes remain orthogonal');
  }
  console.log(`IsoKit render regression passed: ${stages} stages; arrows, lost delivery, pause, reduced motion, projection and labels.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
