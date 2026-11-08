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
  const page = openLesson('#architecture');
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

test('a beginner starts with the guide, follows it into a lesson and retains existing progress', () => {
  const saved = { 'k8s-explorer-completed': '["pod","service"]' };
  const timers = new Map();
  const page = openLesson('', saved, timers);
  try {
    const { document, window } = page;
    assert.equal(document.querySelector('#intro-view').hidden, false);
    assert.equal(document.querySelector('#main').hidden, true);
    assert(document.querySelector('#intro-title').textContent.includes('Docker'));
    assert.equal(document.querySelectorAll('[data-lesson]').length, 27);
    assert.equal(document.querySelectorAll('[data-intro-chapter]').length, 7);
    assert.equal(document.querySelector('#progress-number').textContent, '2 / 27');
    const search = document.querySelector('#search');
    for (const term of ['Kubernetes 入门', '动手试一试']) {
      search.value = term;
      search.dispatchEvent(new window.Event('input'));
      assert(document.querySelector('[data-intro-toggle]'), term);
    }
    search.value = '';
    search.dispatchEvent(new window.Event('input'));
    document.querySelector('[data-intro-chapter="3"]').click();
    assert(document.querySelector('#intro-title').textContent.includes('Pod'));
    assert.equal(document.activeElement.id, 'intro-title');
    document.querySelector('.brand').click();
    assert(document.querySelector('#intro-title').textContent.includes('Docker'));
    document.querySelector('#theme').click();
    assert(document.body.classList.contains('dark'));
    document.querySelector('#intro-view a[href="#architecture"]').click();
    assert.equal(window.location.hash, '#architecture');
    assert.equal(document.querySelector('#intro-view').hidden, true);
    assert.equal(document.querySelector('#main').hidden, false);
    assert.equal(document.querySelectorAll('#diagram [data-node]').length, 9);
    assert.equal(window.localStorage.getItem('k8s-explorer-completed'), saved['k8s-explorer-completed']);
    document.querySelector('#scene-play').click();
    assert.equal(timers.size, 1);
    document.querySelector('[data-intro]').click();
    assert.equal(timers.size, 0, 'opening the guide stops hidden lesson playback');
    assert.equal(window.location.hash, '#intro');
    assert.equal(document.querySelector('#intro-view').hidden, false);
    window.history.replaceState(null, '', '#service');
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    assert.equal(document.querySelector('#scene-title').textContent, 'Service 与 EndpointSlice');
    window.history.replaceState(null, '', '#intro-view');
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    assert.equal(document.querySelector('#intro-view').hidden, false);
    assert.equal(document.querySelector('#progress-number').textContent, '2 / 27');
    assert.equal(page.errors.length, 0);
  } finally { page.close(); }
});

test('the beginner simulation separates desired, pending and ready replicas and replaces Pod identity', async () => {
  const page = openLesson('#intro');
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));
  try {
    const { document } = page;
    const click = async text => {
      const button = [...document.querySelectorAll('#intro-view button')].find(b => b.textContent === text);
      assert(button && !button.disabled, text + ' is available');
      button.focus();
      button.click();
      await tick();
    };
    document.querySelector('[data-intro-chapter="6"]').click();
    assert.equal(document.querySelector('[data-intro-desired]').textContent, '2');
    await click('扩容到 3 个副本');
    assert.equal(document.activeElement.textContent, '就绪检查通过');
    assert.equal(document.querySelector('[data-intro-desired]').textContent, '3');
    assert.equal(document.querySelector('[data-intro-ready]').textContent, '2');
    assert.equal(document.querySelectorAll('[data-intro-pod][data-status="pending"]').length, 1);
    await click('就绪检查通过');
    assert.equal(document.activeElement.textContent, '模拟一个 Pod 故障');
    assert.equal(document.querySelector('[data-intro-ready]').textContent, '3');
    await click('模拟一个 Pod 故障');
    assert.equal(document.activeElement.textContent, '协调创建替代 Pod');
    const failed = document.querySelector('[data-intro-pod][data-status="failed"]').dataset.introPod;
    assert.equal(document.querySelector('[data-intro-desired]').textContent, '3');
    assert.equal(document.querySelector('[data-intro-ready]').textContent, '2');
    await click('协调创建替代 Pod');
    assert.equal(document.activeElement.textContent, '就绪检查通过');
    assert(![...document.querySelectorAll('[data-intro-pod]')].some(p => p.dataset.introPod === failed));
    assert.equal(document.querySelectorAll('[data-intro-pod][data-status="pending"]').length, 1);
    await click('就绪检查通过');
    assert.equal(document.querySelector('[data-intro-ready]').textContent, '3');
    await click('重置');
    assert.equal(document.querySelector('[data-intro-desired]').textContent, '2');
    assert.equal(document.querySelector('[data-intro-ready]').textContent, '2');
    assert.equal(document.querySelector('#progress-number').textContent, '0 / 27');
    assert.equal(document.querySelector('#intro-view a[download]').getAttribute('href'), './examples/lab.yaml');
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

test('short knowledge map titles stay whole instead of leaving a single Chinese character on another line', () => {
  const page = openLesson('#architecture');
  try {
    page.document.querySelector('#map-tab').click();
    for (const [id, title] of [['api', '声明式 API 与对象'], ['pod', 'Pod 与容器生命周期']]) {
      const label = page.document.querySelector('[data-map="' + id + '"] > text:last-child');
      const lines = [...label.querySelectorAll('tspan')].map(line => line.textContent);
      assert.deepEqual(lines, [title], title + ' fits intact on one line');
    }
  } finally { page.close(); }
});

test('directory headings collapse independently while preserving the active lesson and playhead', () => {
  const timers = new Map();
  const page = openLesson('#architecture', {}, timers);
  try {
    const { document, window } = page;
    const heading = () => document.querySelector('[data-lesson="architecture"]');
    const group = () => document.querySelector('[data-nav-group="0"]');
    const intro = () => document.querySelector('[data-intro-toggle]');
    document.querySelector('#stage-rail [data-step="2"]').click();
    document.querySelector('#scene-play').click();
    heading().click();
    assert.equal(heading().getAttribute('aria-expanded'), 'false');
    assert.equal(document.querySelector('#topic-steps-architecture').hidden, true);
    assert.equal(document.activeElement, heading());
    assert.equal(document.querySelector('#step-chip').textContent, '03');
    assert.equal(timers.size, 1);
    timers.get(1)();
    assert.equal(document.querySelector('#step-chip').textContent, '04');
    heading().click();
    assert.equal(heading().getAttribute('aria-expanded'), 'true');
    assert.equal(document.querySelector('#topic-steps-architecture').hidden, false);
    const search = document.querySelector('#search');
    search.value = '集群架构与组件';
    search.dispatchEvent(new window.Event('input'));
    heading().click();
    assert.equal(document.querySelector('#topic-steps-architecture').hidden, true);
    assert.equal(search.value, '集群架构与组件');
    assert.equal(document.querySelector('#step-chip').textContent, '04');
    assert.equal(timers.size, 1);
    heading().click();
    assert.equal(document.querySelector('#topic-steps-architecture').hidden, false);
    search.value = '';
    search.dispatchEvent(new window.Event('input'));
    group().click();
    assert.equal(document.querySelector('#topics-group-0').hidden, true);
    assert.equal(group().getAttribute('aria-expanded'), 'false');
    assert.equal(document.querySelector('#scene-title').textContent, '集群架构与组件');
    assert.equal(document.querySelector('#step-chip').textContent, '04');
    assert.equal(document.activeElement, group());
    intro().click();
    assert.equal(document.querySelector('#intro-chapters').hidden, false);
    assert.equal(window.location.hash, '#architecture', 'opening a folder does not navigate');
    document.querySelector('[data-intro-chapter="3"]').click();
    assert.equal(window.location.hash, '#intro');
    assert(document.querySelector('#intro-title').textContent.includes('Pod'));
    assert.equal(timers.size, 0);
    intro().click();
    assert.equal(document.querySelector('#intro-chapters').hidden, true);
    assert(document.querySelector('#intro-title').textContent.includes('Pod'));
    intro().click();
    assert.equal(document.querySelector('#intro-chapters').hidden, false);
    search.value = '控制循环';
    search.dispatchEvent(new window.Event('input'));
    assert.equal(document.querySelector('#topics-group-0').hidden, false, 'search exposes collapsed matches');
    document.querySelector('[data-lesson="reconcile"]').click();
    assert.equal(document.querySelector('[data-lesson="reconcile"]').getAttribute('aria-expanded'), 'true');
    assert.equal(document.querySelector('#topic-steps-reconcile').hidden, false);
    assert.equal(document.querySelector('#progress-number').textContent, '0 / 27');
    assert.equal(page.errors.length, 0);
  } finally { page.close(); }
});

test('playback speed is explicitly selected without changing the playhead or playback state when opening the menu', () => {
  const timers = new Map(), delays = [];
  const page = openLesson('#architecture', {}, timers);
  try {
    const { document, window } = page;
    const schedule = window.setInterval;
    window.setInterval = (callback, delay) => { delays.push(delay); return schedule(callback, delay); };
    const button = document.querySelector('#speed'), menu = document.querySelector('#speed-menu');
    assert(menu && menu.hidden, 'speed options start closed');
    assert.equal(button.getAttribute('aria-haspopup'), 'menu');
    assert.equal(button.textContent, '1×');
    document.querySelector('#play').click();
    assert.equal(delays.at(-1), 2080, 'new 1× has the former 1.25× stage duration');
    assert.equal(document.querySelector('#diagram .systems-iso').style.getPropertyValue('--phase-time'), '1760ms');
    timers.get(1)();
    const scheduled = timers.get(1);
    button.click();
    assert.equal(button.textContent, '1×', 'opening the menu does not cycle speed');
    assert.equal(menu.hidden, false);
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    assert.equal(timers.get(1), scheduled, 'opening the menu does not restart playback');
    assert.equal(delays.length, 1);
    assert.equal(document.activeElement.dataset.speed, '1');
    assert.equal(menu.querySelector('[data-speed="1"]').getAttribute('aria-checked'), 'true');
    document.activeElement.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(menu.hidden, true);
    assert.equal(document.activeElement, button);
    assert.equal(document.querySelector('#step-chip').textContent, '02', 'Escape dismisses without resetting the stage');
    assert.equal(timers.get(1), scheduled);
    button.click();
    menu.querySelector('[data-speed="1"]').click();
    assert.equal(timers.get(1), scheduled, 'reselecting the current speed keeps its timer');
    for (const speed of [0.5, 1, 1.5, 2]) {
      button.click();
      menu.querySelector('[data-speed="' + speed + '"]').click();
      assert.equal(button.textContent, speed + '×');
      assert.equal(menu.hidden, true);
      assert.equal(button.getAttribute('aria-expanded'), 'false');
      assert.equal(menu.querySelector('[data-speed="' + speed + '"]').getAttribute('aria-checked'), 'true');
      assert.equal(delays.at(-1), 2080 / speed);
      assert.equal(parseFloat(document.querySelector('#diagram .systems-iso').style.getPropertyValue('--phase-time')), 1760 / speed);
      assert.equal(document.querySelector('#play').getAttribute('aria-label'), '暂停演示');
      assert.equal(document.querySelector('#step-chip').textContent, '02');
    }
    document.querySelector('#play').click();
    button.click();
    menu.querySelector('[data-speed="0.5"]').click();
    assert.equal(timers.size, 0, 'choosing a speed while paused does not start playback');
    assert.equal(document.querySelector('#play').getAttribute('aria-label'), '播放演示');
    assert.equal(document.querySelector('#step-chip').textContent, '02');
    assert.equal(page.errors.length, 0);
  } finally { page.close(); }
});

test('the speed menu supports keyboard selection and dismisses on outside interaction', () => {
  const page = openLesson('#architecture');
  try {
    const { document, window } = page;
    const button = document.querySelector('#speed'), menu = document.querySelector('#speed-menu');
    const key = value => document.activeElement.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
    button.focus();
    key('ArrowDown');
    assert(menu && !menu.hidden);
    assert.equal(document.activeElement.dataset.speed, '0.5');
    key('ArrowDown');
    assert.equal(document.activeElement.dataset.speed, '1');
    key('End');
    assert.equal(document.activeElement.dataset.speed, '2');
    key('ArrowRight');
    assert.equal(document.querySelector('#step-chip').textContent, '01', 'menu navigation must not trigger lesson shortcuts');
    document.activeElement.click();
    assert.equal(button.textContent, '2×');
    assert.equal(document.activeElement, button);
    button.click();
    document.querySelector('.canvas-toolbar').click();
    assert.equal(menu.hidden, true);
    assert.equal(button.textContent, '2×');
    button.click();
    document.querySelector('#search').focus();
    assert.equal(menu.hidden, true, 'moving focus outside dismisses the menu');
    button.focus();
    key('ArrowUp');
    assert.equal(document.activeElement.dataset.speed, '2');
    key('Home');
    assert.equal(document.activeElement.dataset.speed, '0.5');
    key('Tab');
    assert.equal(menu.hidden, true);
    assert.equal(page.errors.length, 0);
  } finally { page.close(); }
});

test('playback can pause, finish and reset, while theme and learning marks survive reopening', () => {
  const timers = new Map();
  const page = openLesson('#probes', {}, timers);
  let stored;
  try {
    const { document, window } = page;
    document.querySelector('#scene-play').click();
    assert.equal(document.querySelector('#play').getAttribute('aria-label'), '暂停演示');
    assert.equal(document.querySelector('#scene-play').getAttribute('aria-label'), '暂停当前场景');
    timers.get(1)();
    assert.equal(document.querySelector('#step-chip').textContent, '02');
    document.querySelector('#play').click();
    assert.equal(timers.size, 0);
    assert.equal(document.querySelector('#step-chip').textContent, '02');
    document.querySelector('#play').click();
    const stageCount = document.querySelectorAll('#trace-body tr').length;
    for(let i = 1; i < stageCount - 1; i++) timers.get(1)();
    assert.equal(document.querySelector('#step-chip').textContent, String(stageCount).padStart(2, '0'));
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


test('topology, sequence, component inspection and variable stage controls share a playhead', () => {
  const page = openLesson('#architecture');
  try {
    const { document } = page;
    assert.equal(document.querySelectorAll('#diagram [data-node]').length, 9);
    assert.equal(document.querySelectorAll('#stage-rail button').length, 12);
    document.querySelector('#diagram [data-node="1"]').dispatchEvent(new page.window.MouseEvent('click', { bubbles: true }));
    assert(document.querySelector('#node-insight').textContent.includes('API Server'));
    assert(document.querySelectorAll('#node-insight [data-step]').length > 4);
    document.querySelector('#sequence-tab').click();
    assert.equal(document.querySelector('#sequence-tab').getAttribute('aria-selected'), 'true');
    assert.equal(document.querySelectorAll('[data-sequence-step]').length, 12);
    document.querySelector('[data-sequence-step="10"]').dispatchEvent(new page.window.MouseEvent('click', { bubbles: true }));
    assert.equal(document.querySelector('#flow-count').textContent, '11 / 12');
    const keyboardStep = document.querySelector('[data-sequence-step="9"]');
    keyboardStep.dispatchEvent(new page.window.KeyboardEvent('keydown', { key:' ', bubbles:true }));
    assert.equal(document.querySelector('#step-chip').textContent, '10');
    assert.equal(document.querySelector('#play').getAttribute('aria-label'), '播放演示');
    document.querySelector('[data-sequence-step="10"]').dispatchEvent(new page.window.MouseEvent('click', { bubbles: true }));
    document.querySelector('#mechanism-tab').click();
    assert.equal(document.querySelector('#step-chip').textContent, '11');
    document.querySelector('#expand-scene').click();
    assert(document.querySelector('#main').classList.contains('expanded'));
    assert.equal(document.querySelector('.sidebar').inert, true);
    document.querySelector('#expand-scene').click();
    assert(!document.body.classList.contains('canvas-open'));
    document.querySelector('[data-lesson="deployment"]').click();
    document.querySelector('#stage-rail [data-step="4"]').click();
    assert.equal(document.querySelector('[data-node="4"]').dataset.status, 'removed');
    assert.equal(document.querySelector('[data-node="6"]').dataset.status, 'ready');
    document.querySelector('#reset').click();
    assert.equal(document.querySelector('[data-node="4"]').dataset.status, 'ready');
    assert.equal(document.querySelector('[data-node="6"]').dataset.status, 'pending');
    document.querySelector('#fault').click();
    assert.equal(document.querySelectorAll('#stage-rail button').length, 4);
    assert.equal(document.querySelectorAll('#diagram [data-node]').length, 4);
    assert.equal(page.errors.length, 0);
  } finally { page.close(); }
});
