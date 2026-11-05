const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function course() {
  const scope = {};
  vm.runInNewContext(fs.readFileSync('dist/data.js', 'utf8') + '\n;this.course = typeof K8sCourse !== "undefined" ? K8sCourse : { GROUPS, LESSONS, SOURCES };', scope);
  return scope.course;
}

test('learners can explore 27 Kubernetes topics across the three agreed paths', () => {
  const { GROUPS, LESSONS } = course();
  assert.deepEqual(Array.from(GROUPS, g => g.name), ['基础与架构', '应用与流量', '运维与排障']);
  assert.equal(LESSONS.length, 27);
  assert.deepEqual([0, 1, 2].map(i => LESSONS.filter(l => l.group === i).length), [9, 9, 9]);
  assert.deepEqual(Array.from(LESSONS, l => l.id), [
    'architecture', 'api', 'reconcile', 'pod', 'namespace', 'labels', 'scheduling', 'resources', 'probes',
    'deployment', 'statefulset', 'daemonset', 'jobs', 'config', 'service', 'dns', 'ingress', 'storage',
    'network-policy', 'rbac', 'pod-security', 'hpa', 'observability', 'pod-debug', 'service-debug', 'drain', 'backup-upgrade'
  ]);
});

test('every main and fault scenario has complete teaching steps and a downloadable example', () => {
  const { LESSONS, SOURCES } = course();
  const ids = new Set(LESSONS.map(l => l.id));
  const relations = new Set(['request', 'data', 'control', 'check', 'reject', 'lost', 'local', 'compare']);
  let stages = 0;
  for (const lesson of LESSONS) {
    assert.equal(lesson.sections.length, 3, lesson.id + ' has deeper explanations');
    assert(lesson.sources.length >= 2, lesson.id + ' has primary sources');
    for (const sourceId of lesson.sources) {
      const source = SOURCES[sourceId];
      assert(source, 'missing source ' + sourceId);
      assert.equal(new URL(source.url).hostname, 'kubernetes.io');
    }
    for (const id of lesson.related) {
      assert(ids.has(id) && id !== lesson.id, lesson.id + ' has valid related topics');
    }
    for (const [name, scene] of [['main', lesson], ['fault', lesson.fault]]) {
      assert(scene.nodes.length >= 4);
      assert.equal(new Set(scene.nodes).size, scene.nodes.length, lesson.id + ' unique participants');
      assert(scene.steps.length >= 4);
      assert(scene.code.length >= 3);
      if (scene.groups) {
        const grouped = Array.from(scene.groups.flatMap(g => g.nodes)).sort((a,b) => a-b);
        assert.deepEqual(grouped, Array.from(scene.nodes, (_, i) => i), lesson.id + ' groups partition participants');
      }
      for (const milestone of scene.milestones || []) {
        assert(milestone.step >= 0 && milestone.step < scene.steps.length);
        assert(milestone.node >= 0 && milestone.node < scene.nodes.length);
      }
      assert(scene.example.prerequisite && scene.example.expected);
      for (const frame of scene.steps) {
        assert.equal(frame.length, 7);
        assert(Number.isInteger(frame[1]) && frame[1] >= 0 && frame[1] < scene.nodes.length);
        assert(Number.isInteger(frame[2]) && frame[2] >= 0 && frame[2] < scene.nodes.length);
        assert(relations.has(frame[6]));
        assert.equal(frame[1] === frame[2], frame[6] === 'local', lesson.id + ' local/transfer meaning');
        assert(frame[0] && frame[3] && frame[4] && frame[5]);
        stages++;
      }
      const extension = scene.example.language === 'yaml' ? 'yaml' : 'sh';
      const file = `dist/examples/${lesson.id}-${name}.${extension}`;
      assert(fs.existsSync(file), file + ' can be downloaded');
      assert(fs.readFileSync(file, 'utf8').includes(scene.example.code));
    }
  }
  assert(stages > 290, 'expanded mechanisms have substantially more teaching stages');
  assert(LESSONS.every(lesson => lesson.nodes.length > 4 && lesson.steps.length > 4));
  assert(new Set(LESSONS.map(l => l.nodes.length)).size >= 3, 'topologies vary by topic');
  assert(fs.existsSync('dist/examples/lab.yaml'));
});
