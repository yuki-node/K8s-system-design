const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const { JSDOM } = require('jsdom');

test('diagram symbols distinguish controllers, resources, observations and generic data planes', async () => {
  const { componentVisual } = await import('../src/component-visuals.mjs');
  assert.equal(componentVisual('Deployment').id, 'deployment');
  assert.equal(componentVisual('Deployment 控制器').id, 'controller');
  assert.equal(componentVisual('旧 ReplicaSet').id, 'replicaset');
  assert.equal(componentVisual('ReplicaSet 控制器').id, 'controller');
  assert.equal(componentVisual('Pod 对象').id, 'pod');
  assert.equal(componentVisual('Pod 条件').id, 'inspect');
  assert.equal(componentVisual('readiness 检查').id, 'probe');
  assert.equal(componentVisual('Service 对象').icon, 'svc');
  assert.equal(componentVisual('Service 数据面').source, 'teaching');
  assert.equal(componentVisual('kube-proxy').icon, 'k-proxy');
  assert.equal(componentVisual('资源指标 API').id, 'metrics');
  assert.equal(componentVisual('API Server').icon, 'api');
  assert.equal(componentVisual('独立 PVC web-1').icon, 'pvc');
  assert.equal(componentVisual('StorageClass').icon, 'sc');
  assert.equal(componentVisual('Pod 安全准入').source, 'teaching', 'do not use the removed PodSecurityPolicy API icon');
});

test('all official symbols resolve offline to intact, self-contained SVG artwork', async () => {
  const { COMPONENT_VISUALS } = await import('../src/component-visuals.mjs');
  const directory = 'dist/assets/kubernetes/';
  const manifest = JSON.parse(fs.readFileSync(directory + 'manifest.json', 'utf8'));
  const entries = new Map(manifest.icons.map(icon => [icon.id, icon]));
  for (const visual of Object.values(COMPONENT_VISUALS).filter(visual => visual.source === 'kubernetes')) {
    const entry = entries.get(visual.icon);
    assert(entry, visual.icon + ' attribution exists');
    assert.equal(new URL(entry.url).hostname, 'raw.githubusercontent.com');
    assert(new URL(entry.url).pathname.startsWith('/kubernetes/community/'));
    const bytes = fs.readFileSync(directory + entry.file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, visual.icon + ' matches original artwork');
    const svg = new JSDOM(bytes.toString(), { contentType: 'image/svg+xml' });
    try {
      const root = svg.window.document.documentElement;
      assert.equal(root.localName, 'svg');
      assert(root.getAttribute('viewBox'));
      assert.equal(root.querySelectorAll('script, foreignObject, image').length, 0, visual.icon + ' needs no external images or scripts');
      for (const element of root.querySelectorAll('*')) for (const attribute of element.attributes) {
        if (attribute.localName === 'href') assert(attribute.value.startsWith('#'), 'only local references');
      }
    } finally { svg.window.close(); }
  }
});


test('component silhouettes preserve role differences in the isometric scene', async () => {
  const { componentVisual, componentModel } = await import('../src/component-visuals.mjs');
  assert.equal(componentModel(componentVisual('kubectl')), 'laptop');
  assert.equal(componentModel(componentVisual('API Server')), 'rack');
  assert.equal(componentModel(componentVisual('etcd')), 'database');
  assert.equal(componentModel(componentVisual('Pod 对象')), 'pod');
  assert.equal(componentModel(componentVisual('容器运行时')), 'container');
  assert.notEqual(componentModel(componentVisual('Deployment')), componentModel(componentVisual('Deployment 控制器')));
});
