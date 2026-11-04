const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const scope={};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8')+';this.lessons=LESSONS;this.sources=SOURCES;',scope);
vm.runInNewContext(fs.readFileSync('dist/mechanisms.js','utf8')+';this.details=MECHANISM_DETAILS;this.readings=CSAPP_READINGS;',scope);
const lessons=scope.lessons,ids=new Set(lessons.map(l=>l.id));
assert.equal(lessons.length,27);assert.equal(ids.size,27);assert.deepEqual([0,1,2].map(g=>lessons.filter(l=>l.group===g).length),[8,8,11]);
assert.deepEqual(Object.keys(scope.details).sort(),[...ids].sort(),'Every existing topic needs mechanism details');
for(const l of lessons){
  const d=scope.details[l.id];
  assert(d.sections.length>0&&d.sections.every(s=>s.title&&s.body),l.id+' mechanism sections');
  assert(d.foundation&&d.readings.length>0,l.id+' CSAPP foundation and reading');
  for(const id of d.readings){const r=scope.readings[id];assert(r&&r.section&&r.title&&r.path&&r.note,l.id+' CSAPP reference '+id);}
  for(const id of d.sources||[])assert(scope.sources[id],l.id+' additional source '+id);
}
const kinds=new Set(['request','data','control','check','reject','lost','local','compare']);
let count=0;
for(const l of lessons){
  assert(l.fault&&Array.isArray(l.fault.steps),l.id+' needs a complete independent alternate scenario');
  assert.notEqual(l.steps,l.fault.steps,l.id+' scenarios must not share a mutable steps array');
  for(const [caseName,c] of [['main',l],['alternate',l.fault]]){
    assert.equal(c.nodes.length,4,l.id+' '+caseName+' node count');assert.equal(c.steps.length,4,l.id+' '+caseName+' stage count');assert(Array.isArray(c.code)&&c.code.length>0,l.id+' '+caseName+' pseudocode');
    for(const s of c.steps){count++;assert.equal(s.length,7,l.id+' '+caseName+' frame schema');assert(s[1]>=0&&s[1]<4&&s[2]>=0&&s[2]<4,l.id+' node index');assert(kinds.has(s[6]),l.id+' relation type');assert.equal(s[1]===s[2],s[6]==='local',l.id+' internal operations must not invent a transfer');for(const i of [0,3,4,5])assert(typeof s[i]==='string'&&s[i].trim().length>0,l.id+' nonempty frame text');}
  }
  for(const r of l.related)assert(ids.has(r),l.id+' related '+r);
  for(const id of l.sources){const source=scope.sources[id];assert(source,l.id+' source '+id);assert(/^https:\/\//.test(source.url),l.id+' source HTTPS');}
}
// Regression checks for previously misleading relationships and traces.
const cache=lessons.find(l=>l.id==='cache');assert(!cache.nodes.some(n=>/^缓存行$/.test(n)),'A cache line is not a separate storage device');
const raft=lessons.find(l=>l.id==='raft');assert(raft.steps.some(s=>/Follower|副本 B/.test(raft.nodes[s[1]])&&/Leader|领导/.test(raft.nodes[s[2]])&&/ACK|确认|响应/.test(s.join(' '))),'Raft confirmation must come from follower to leader');
assert.equal(raft.fault.steps[1][6],'lost','Undelivered replication must not look like a successful transfer');
const mvcc=lessons.find(l=>l.id==='mvcc');assert(mvcc.fault.nodes.some(n=>/医生|T1|事务 A/.test(n)),'Write-skew scenario needs its own actors');
const wal=lessons.find(l=>l.id==='wal');assert(/commit|提交/.test(wal.code.join(' '))&&/flush|sync|持久/.test(wal.code.join(' ')),'WAL example must describe commit durability as well as page ordering');
const index=lessons.find(l=>l.id==='index');assert(/else|switch|另一方案/.test(index.code.join(' ')),'B+ tree and LSM are alternative write paths');
console.log(`Content contracts passed: 27 lessons, 54 independent scenarios, ${count} typed stages, valid references. These checks do not prove protocol correctness.`);
