const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');

function openLesson(hash = '', stored = {}, timers) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(fs.readFileSync('dist/index.html', 'utf8'), {
    url: 'http://localhost/K8s-system-design/' + hash,
    runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole,
  });
  const { window } = dom;
  // jsdom has no OS media query service. The rendering and app code are the actual bundles.
  window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  if (timers) {
    window.setInterval = (callback) => { timers.set(1, callback); return 1; };
    window.clearInterval = id => timers.delete(id);
  }
  for (const [key, value] of Object.entries(stored)) window.localStorage.setItem(key, value);
  for (const file of ['data.js', 'isokit.js', 'app.js']) vm.runInContext(fs.readFileSync('dist/' + file, 'utf8'), dom.getInternalVMContext());
  if (errors.length) throw errors[0];
  return { dom, window, document: window.document, close: () => window.close(), errors };
}

test('a learner searches Kubernetes symptoms, opens a topic and reads its scenario example', () => {
  const page = openLesson();
  try {
    const { document, window } = page;
    assert.equal(document.querySelector('#scene-title').textContent, '集群架构与组件');
    assert.equal(document.querySelectorAll('[data-lesson]').length, 27);
    const search = document.querySelector('#search');
    search.value = 'CrashLoopBackOff';
    search.dispatchEvent(new window.Event('input'));
    const result = document.querySelector('[data-lesson="pod-debug"]');
    assert(result, 'search finds the debugging topic from a symptom');
    result.click();
    assert.equal(window.location.hash, '#pod-debug');
    document.querySelector('[data-detail="code"]').click();
    assert(document.querySelector('#detail-content').textContent.includes('kubectl'));
    assert(document.querySelector('#detail-content').textContent.includes('前提'));
    assert(document.querySelector('#example-download').getAttribute('href').endsWith('pod-debug-main.sh'));
    document.querySelector('#fault').click();
    assert.equal(document.querySelector('#fault').getAttribute('aria-pressed'), 'true');
    assert(document.querySelector('#example-download').getAttribute('href').endsWith('pod-debug-fault.sh'));
    assert.equal(document.querySelectorAll('#diagram [data-node]').length, 4);
    assert.equal(page.errors.length, 0);
  } finally { page.close(); }
});

test('the knowledge map shows direct associations in both directions', () => {
  const page = openLesson('#api');
  try {
    page.document.querySelector('#map-tab').click();
    assert.equal(page.document.querySelectorAll('.map-node').length, 27);
    assert(page.document.querySelector('[data-related-from="api"][data-related-to="architecture"]'), 'reverse association is visible');
    page.document.querySelector('[data-map="architecture"]').dispatchEvent(new page.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    assert.equal(page.document.querySelector('#scene-title').textContent, '集群架构与组件');
  } finally { page.close(); }
});

test('playback can pause, finish and reset, while theme and learning marks survive reopening', () => {
  const timers = new Map();
  const page = openLesson('#probes', {}, timers);
  let stored;
  try {
    const { document, window } = page;
    document.querySelector('#play').click();
    assert.equal(document.querySelector('#play').getAttribute('aria-label'), '暂停演示');
    timers.get(1)();
    assert.equal(document.querySelector('#step-chip').textContent, '02');
    document.querySelector('#play').click();
    assert.equal(timers.size, 0);
    assert.equal(document.querySelector('#step-chip').textContent, '02');
    document.querySelector('#play').click();
    timers.get(1)(); timers.get(1)();
    assert.equal(document.querySelector('#step-chip').textContent, '04');
    assert.equal(document.querySelector('#play').getAttribute('aria-label'), '暂停演示', 'final stage gets a full dwell');
    timers.get(1)();
    assert.equal(timers.size, 0);
    assert.equal(document.querySelector('#complete').getAttribute('aria-pressed'), 'true');
    document.querySelector('#reset').click();
    assert.equal(document.querySelector('#step-chip').textContent, '01');
    document.querySelector('#theme').click();
    assert(document.body.classList.contains('dark'));
    stored = Object.fromEntries(['k8s-explorer-dark', 'k8s-explorer-completed'].map(key => [key, window.localStorage.getItem(key)]));
  } finally { page.close(); }
  const reopened = openLesson('#probes', stored);
  try {
    assert(reopened.document.body.classList.contains('dark'));
    assert.equal(reopened.document.querySelector('#complete').getAttribute('aria-pressed'), 'true');
    assert.equal(reopened.document.querySelector('#progress-number').textContent, '1 / 27');
  } finally { reopened.close(); }
});

test('invalid saved progress does not prevent a learner opening the course', () => {
  const page = openLesson('#not-a-topic', { 'k8s-explorer-completed': '{"unexpected":true}', 'k8s-explorer-dark': 'null' });
  try {
    assert.equal(page.document.querySelector('#scene-title').textContent, '集群架构与组件');
    assert.equal(page.document.querySelector('#progress-number').textContent, '0 / 27');
    assert(!page.document.body.classList.contains('dark'));
  } finally { page.close(); }
});
