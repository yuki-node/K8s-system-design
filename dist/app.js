'use strict';
const { SOURCES, GROUPS, LESSONS, COURSE_META } = window.K8sCourse;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="./icons.svg#${name}"/></svg>`;
const byId=Object.fromEntries(LESSONS.map(l=>[l.id,l]));
const sourceById=SOURCES;
const safeRead=(k,otherwise)=>{try{return JSON.parse(localStorage.getItem(k))??otherwise}catch{return otherwise}};
function readCompleted(){const value=safeRead('k8s-explorer-completed',[]);return new Set(Array.isArray(value)?value.filter(id=>typeof id==='string'&&byId[id]):[])}
let completed=readCompleted();
let current=byId[location.hash.slice(1)]||LESSONS[0],step=0,fault=false,filter='all',query='',detail='concept',view='mechanism',timer=null,speed=1,toastTimer;
let dark=safeRead('k8s-explorer-dark',false)===true;
let motionMode='preview',motionVersion=0,playbackEnded=false;
let renderedDetail='';
let diagramView='topology',selectedNode=null,expanded=false;
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
function cueMotion(){motionMode='preview';motionVersion++;playbackEnded=false;}
function saveProgress(){try{localStorage.setItem('k8s-explorer-completed',JSON.stringify([...completed]))}catch{}}
function saveTheme(){try{localStorage.setItem('k8s-explorer-dark',JSON.stringify(dark))}catch{}}
function scenario(){return fault?current.fault:current}
function frames(){return scenario().steps}
function nodes(){return scenario().nodes}
const RELATIONS={request:'请求传递',data:'数据传递',control:'控制关系',check:'条件校验',reject:'请求被拒绝',lost:'传递中断 · 未到达',local:'内部操作',compare:'方案对照'};
function relationText(s){const ns=nodes();if(s[6]==='local')return ns[s[1]]+' · 内部操作';if(s[6]==='compare')return ns[s[1]]+' ｜ '+ns[s[2]]+' · 对照';if(s[6]==='lost')return ns[s[1]]+' ⇢ × · 未到达 '+ns[s[2]];return ns[s[1]]+(s[6]==='request'||s[6]==='data'?' → ':' ⇢ ')+ns[s[2]]}
function currentFrame(){return frames()[step]}
function accent(){return dark?['#82adff','#63cec4','#b79aeb'][current.group]:GROUPS[current.group].color}
function theme(){document.body.classList.toggle('dark',dark);document.body.style.setProperty('--accent',accent());$('#theme').setAttribute('aria-label',dark?'切换浅色主题':'切换深色主题');$('#theme').innerHTML=icon(dark?'sun':'moon');saveTheme()}
function notify(s){clearTimeout(toastTimer);$('#toast').textContent=s;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
function updateProgress(){const n=completed.size;$('#progress-number').textContent=`${n} / ${LESSONS.length}`;$('#progress-bar').style.width=`${n/LESSONS.length*100}%`;$('#complete').innerHTML=completed.has(current.id)?`${icon('check')}<span>已学 · 取消标记</span>`:`<span>标记已学</span>${icon('check')}`;$('#complete').setAttribute('aria-pressed',String(completed.has(current.id)))}
function stop(){if(timer)clearInterval(timer);timer=null;motionMode='paused';syncScenePlayer();$('#play').innerHTML=`${icon('play')}<span>播放</span>`;$('#play').setAttribute('aria-label','播放演示');if($('#diagram svg'))draw();}
function play(){
 if(timer){stop();return}
 if(playbackEnded||(step>=frames().length-1&&motionMode==='preview')){step=0;motionVersion++;playbackEnded=false;}
 motionMode='playing';
 $('#play').innerHTML=`${icon('pause')}<span>暂停</span>`;$('#play').setAttribute('aria-label','暂停演示');
 timer=setInterval(()=>{
  if(step<frames().length-1){step++;renderStep();}
  else{playbackEnded=true;stop();finish();}
 },2600/speed);
 renderStep();
}
function finish(){if(!completed.has(current.id)){completed.add(current.id);saveProgress();renderNav();updateProgress();renderMap();notify(`已完成「${current.title}」的探索`)}}
function goStep(n){stop();step=Math.max(0,Math.min(frames().length-1,n));cueMotion();renderStep();if(step===frames().length-1)finish()}
function closeMenu(){$('#sidebar').classList.remove('open');$('#shade').hidden=true;$('#menu').setAttribute('aria-expanded','false')}
function select(id,updateHash=true){if(!byId[id])return;stop();current=byId[id];step=0;fault=false;selectedNode=null;cueMotion();detail='concept';view='mechanism';if(filter!=='all'&&Number(filter)!==current.group)filter='all';query='';$('#search').value='';if(updateHash&&location.hash!==`#${id}`)history.pushState(null,'',`#${id}`);closeMenu();render();}
function renderNav(){const eligible=LESSONS.filter(l=>(filter==='all'||l.group===Number(filter))&&`${l.title} ${l.en} ${l.summary} ${l.principle} ${l.pitfall} ${l.steps.flat().join(' ')} ${l.fault.steps.flat().join(' ')} ${l.sections.map(s=>s.title+' '+s.body).join(' ')} ${l.example.code} ${l.fault.name} ${l.fault.example.code}`.toLowerCase().includes(query.toLowerCase()));let html='';GROUPS.forEach((g,i)=>{const list=eligible.filter(l=>l.group===i);if(!list.length)return;html+=`<div class="topic-group"><b>0${i+1} / ${g.name}</b><span>${list.length}</span></div>`;for(const l of list){const active=l.id===current.id;html+=`<button class="topic ${active?'active':''} ${completed.has(l.id)?'done':''}" data-lesson="${l.id}" ${active?'aria-current="true"':''} aria-label="${l.title}"><span class="topic-dot"></span><span><strong>${l.title}</strong><small>${l.en}</small></span><span class="chev">${icon(active?'chevron-down':'chevron-right')}</span></button>`;if(active&&!query)html+=`<div class="topic-steps">${frames().map((s,j)=>`<button class="topic-step ${step===j?'active':''}" data-step="${j}" aria-label="步骤 ${j+1}：${s[0]}"><span>${j+1}</span>${s[0]}</button>`).join('')}</div>`;}});$('#topic-list').innerHTML=html||'<div class="empty">没有找到匹配的主题。<br>试试「探针」「Pending」或「DNS」。</div>';$$('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter===filter))}
function relationButtons(){return current.related.filter(id=>byId[id]).map(id=>`<button data-related="${id}">${byId[id].title} ${icon('arrow-up-right')}</button>`).join('')}
function exampleHref(){return `./examples/${current.id}-${fault?'fault':'main'}.${scenario().example.language==='yaml'?'yaml':'sh'}`}
function renderDetail(){
 const s=currentFrame(),key=current.id+':'+detail+':'+fault;
 $$('[data-detail]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.detail===detail)));
 if(renderedDetail===key){
  if(detail==='code'){
   $('#scenario-state').textContent=s[5];
   $('#scenario-explanation').textContent=s[4];
  }
  return;
 }
 let html='';
 if(detail==='concept'){
  const sections=current.sections.map(section=>`<div class="detail-section"><h4>${esc(section.title)}</h4><p>${esc(section.body)}</p></div>`).join('');
  html=`<h3>${esc(current.en)}</h3><p>${esc(current.summary)}</p><div class="principle">${esc(current.principle)}</div>${sections}<div class="detail-section"><h4>关键取舍</h4><p>${esc(current.tradeoff)}</p></div><div class="detail-section"><h4>容易误解</h4><p class="warning">${esc(current.pitfall)}</p></div><div class="detail-section"><h4>关联主题</h4><div class="related">${relationButtons()}</div></div>`;
 }else if(detail==='code'){
  const example=scenario().example;
  html=`<div class="snapshot"><span>当前阶段 · 状态观察</span><strong id="scenario-state">${esc(s[5])}</strong></div><div class="example-heading"><h3>${esc(example.title)}</h3><span class="code-language">${example.language==='yaml'?'YAML':'kubectl / Shell'}</span></div><div class="lab-prerequisite"><h4>前提</h4><p>${esc(example.prerequisite)}</p></div><div class="example-actions"><button class="outline-button" data-copy-example>复制示例</button><a id="example-download" class="outline-button" href="${exampleHref()}" download="${esc(example.filename||current.id+'-'+(fault?'fault':'main')+'.sh')}">下载 ${example.language==='yaml'?'YAML':'命令'}</a></div><pre class="example-code"><code>${esc(example.code)}</code></pre><div class="detail-section"><h4>预期与边界</h4><p>${esc(example.expected)}</p></div><p class="source-note"><a href="./examples/lab.yaml" download="lab.yaml">下载入门实验 lab.yaml ${icon('arrow-up-right')}</a><br>创建 demo 命名空间、两个 web 副本与集群内 Service。请在自己的实验集群执行。</p><details class="mechanism-steps"><summary>查看机制步骤（概念说明）</summary><ol>${scenario().code.map(line=>`<li>${esc(line)}</li>`).join('')}</ol></details><div class="detail-section"><h4>当前场景解释</h4><p id="scenario-explanation">${esc(s[4])}</p></div>`;
 }else{
  html=`<h3>沿着官方文档继续</h3><p class="source-note">讲解与场景为教学整理，具体版本与插件行为请核对对应文档。${esc(COURSE_META.scope)}</p>${current.sources.map(id=>{const src=sourceById[id];return `<a class="source-card" href="${esc(src.url)}" target="_blank" rel="noopener noreferrer"><small class="source-kind">${esc(src.kind)}</small><strong>${esc(src.name)} ${icon('arrow-up-right')}</strong><span>${esc(src.note)}</span></a>`}).join('')}<div class="detail-section"><h4>本路径关注的问题</h4><p>${esc(GROUPS[current.group].question)}</p><p class="source-note">内容整理：${esc(COURSE_META.reviewed)}</p><button class="outline-button" data-about>查看课程与来源说明 ${icon('arrow-up-right')}</button></div>`;
 }
 $('#detail-content').innerHTML=html;
 $('#detail-content').scrollTop=0;
 renderedDetail=key;
}
async function copyExample(){
 try{await navigator.clipboard.writeText(scenario().example.code);notify('已复制当前场景示例')}
 catch{notify('无法自动复制，请在示例中选择文本复制')}
}
function labelLines(text){const max=16,lines=[];let line='',units=0;const tokens=text.match(/[A-Za-z0-9_=./+\-]+|[^\x00-\x7F]|\s+|./gu)||[];for(const token of tokens){const w=[...token].reduce((n,ch)=>n+(/[^\x00-\x7F]/.test(ch)?2:1),0);if(units+w>max&&line.trim()){lines.push(line.trim());line='';units=0}if(!line&&/^\s+$/.test(token))continue;line+=token;units+=w}if(line.trim())lines.push(line.trim());return lines;}
function revealInScroller(scroller,target,padding=12){
 if(!target)return;const bounds=scroller.getBoundingClientRect(),item=target.getBoundingClientRect();
 if(item.bottom>bounds.bottom-padding)scroller.scrollTop+=item.bottom-bounds.bottom+padding;
 else if(item.top<bounds.top+padding)scroller.scrollTop=Math.max(0,scroller.scrollTop+item.top-bounds.top-padding);
}
function draw(){
 const s=currentFrame(),kind=s[6];
 window.SystemsDiagram.render({
  label:current.title+'：'+s[0]+'；'+RELATIONS[kind]+'；'+relationText(s),
  nodes:nodes(),frame:s,frames:frames(),frameIndex:step,groups:scenario().groups,milestones:scenario().milestones,playing:!!timer,motionMode,motionVersion,speed,dark,
  viewMode:diagramView,selectedNode,onInspectNode:inspectNode,onSelectStep:goStep,
  stageKey:current.id+':'+(fault?'alternate':'main')+':'+step,
  reducedMotion:motionPreference.matches
 });
 $('#participant-count').textContent=nodes().length;$('#stage-count').textContent=frames().length;
 $('#diagram').classList.toggle('sequence-mode',diagramView==='sequence');
 if(diagramView==='sequence')revealInScroller($('#diagram'),$('#diagram [data-sequence-step="'+step+'"]'));
 $('#diagram-hint').textContent=diagramView==='sequence'?'可横向滚动 · 点击时序行定位阶段':'可横向滚动 · 点击组件探索';
 renderNodeInsight();
 $('#relation-kind').textContent=RELATIONS[kind];$('#diagram-state').textContent=s[5];
}
function inspectNode(index){selectedNode=selectedNode===index?null:index;draw()}
function renderNodeInsight(){
 const panel=$('#node-insight');panel.hidden=diagramView==='sequence';
 if(selectedNode===null){panel.innerHTML='<span>等距立体模型 · 保留官方识别图标</span>';return}
 const related=frames().map((frame,i)=>({frame,i})).filter(({frame})=>frame[1]===selectedNode||frame[2]===selectedNode);
 panel.innerHTML=`<strong>${esc(nodes()[selectedNode])}</strong><span>参与 ${related.length} 个阶段</span><div>${related.map(({frame,i})=>`<button data-step="${i}" class="${step===i?'active':''}" title="${esc(frame[0])}">${String(i+1).padStart(2,'0')} ${esc(frame[0])}</button>`).join('')}</div><button class="node-dismiss" aria-label="关闭组件说明">×</button>`;
 panel.querySelector('.node-dismiss').onclick=()=>{selectedNode=null;draw()};
}
function toggleExpanded(){expanded=!expanded;$('#main').classList.toggle('expanded',expanded);document.body.classList.toggle('canvas-open',expanded);$$('.topbar,.sidebar,.inspector,.flow').forEach(el=>{el.inert=expanded});$('#expand-scene').textContent=expanded?'收起画布 ↙':'展开画布 ↗';$('#expand-scene').setAttribute('aria-label',expanded?'收起画布':'展开画布');$('#expand-scene').setAttribute('aria-pressed',String(expanded));draw()}
$('#expand-scene').onclick=toggleExpanded;
function syncScenePlayer(){
 $('#scene-play').innerHTML=icon(timer?'pause':'play');$('#scene-play').setAttribute('aria-label',timer?'暂停当前场景':'播放当前场景');$('#scene-prev').disabled=step===0;$('#scene-next').disabled=step===frames().length-1;
}
$('#scene-play').onclick=play;$('#scene-prev').onclick=()=>goStep(step-1);$('#scene-next').onclick=()=>goStep(step+1);
function renderTrace(){syncScenePlayer();const list=frames();$('#trace-body').innerHTML=list.map((s,i)=>`<tr class="${i===step?'current':i<step?'done':''}" data-trace="${i}" tabindex="0" aria-label="查看步骤 ${i+1}：${s[0]}" ${i===step?'aria-current="step"':''}><td><span class="row-no">${i+1}</span></td><td><span class="signal">${esc(s[3])}</span></td><td class="route">${esc(relationText(s))}</td><td>${esc(s[5])}</td></tr>`).join('');$('#flow-count').textContent=`${String(step+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;$('#stage-rail').innerHTML=list.map((s,i)=>`<button data-step="${i}" class="${i===step?'active':i<step?'visited':''}" aria-label="步骤 ${i+1}：${esc(s[0])}" ${i===step?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span><i></i></button>`).join('');$('#previous').disabled=step===0;$('#next').disabled=step===list.length-1;if(step===0)$('.trace-scroll').scrollTop=0;else revealInScroller($('.trace-scroll'),$('#trace-body tr.current'),28);}
function renderStep(){step=Math.min(step,frames().length-1);const s=currentFrame();$('#step-chip').textContent=String(step+1).padStart(2,'0');$('#step-title').textContent=s[0];$('#step-signal').textContent=s[3];$('#step-description').textContent=s[4];draw();renderTrace();renderDetail();$$('[data-step]').forEach(b=>b.classList.toggle('active',Number(b.dataset.step)===step));$('#normal').classList.toggle('selected',!fault);$('#normal').setAttribute('aria-pressed',String(!fault));$('#fault').classList.toggle('selected',fault);$('#fault').setAttribute('aria-pressed',String(fault));}
function renderView(){const isMap=view==='map';$('#lesson-view').hidden=isMap;$('#map-view').hidden=!isMap;$('#mechanism-tab').setAttribute('aria-selected',String(!isMap&&diagramView==='topology'));$('#sequence-tab').setAttribute('aria-selected',String(!isMap&&diagramView==='sequence'));$('#map-tab').setAttribute('aria-selected',String(isMap));if(isMap)renderMap()}
function renderMap(){
 const width=680,col=218,pad=14,row=68,start=85,positions={};
 GROUPS.forEach((g,gi)=>LESSONS.filter(l=>l.group===gi).forEach((l,j)=>positions[l.id]={x:pad+gi*col,y:start+j*row}));
 const related=new Set(current.related),origin=positions[current.id];let links='',cards='',heads='';
 for(const id of related){const dest=positions[id];if(!dest)continue;const a=origin,b=dest;let d;
 if(a.x===b.x){const lane=a.x+200;d=`M${a.x+192} ${a.y+23}H${lane}V${b.y+23}H${b.x+192}`;}
 else{const right=b.x>a.x,ax=a.x+(right?192:0),bx=b.x+(right?0:192),mid=(ax+bx)/2;
 if(Math.abs(a.x-b.x)>col){const laneA=ax+(right?12:-12),laneB=bx+(right?-12:12);d=`M${ax} ${a.y+23}H${laneA}V70H${laneB}V${b.y+23}H${bx}`;}
 else d=`M${ax} ${a.y+23} C${mid} ${a.y+23} ${mid} ${b.y+23} ${bx} ${b.y+23}`;}
 links+=`<path class="map-relation" data-related-from="${current.id}" data-related-to="${id}" d="${d}" fill="none" stroke="var(--accent)" stroke-width="1.5"><title>${esc(current.title+' 与 '+byId[id].title+' 相关')}</title></path>`;}
 GROUPS.forEach((g,gi)=>{const x=pad+gi*col,ls=LESSONS.filter(l=>l.group===gi),color=dark?['#82adff','#63cec4','#b79aeb'][gi]:g.color;heads+=`<text x="${x+96}" y="30" text-anchor="middle" style="fill:${color};font-size:16px;font-weight:600">0${gi+1} ${g.name}</text><text x="${x+96}" y="53" text-anchor="middle" style="fill:var(--muted);font:12px monospace">${ls.length} TOPICS</text>`;
 ls.forEach(l=>{const {x,y}=positions[l.id],labels=labelLines(l.title);cards+=`<a class="map-node ${current.id===l.id?'selected':''} ${related.has(l.id)?'related-node':''} ${completed.has(l.id)?'completed':''}" href="#${l.id}" data-map="${l.id}" aria-label="打开${l.title}"><rect x="${x}" y="${y}" width="192" height="46" rx="3"/>${completed.has(l.id)?`<g class="map-check" aria-hidden="true" transform="translate(${x+8} ${y+15})"><use href="./icons.svg#check" width="16" height="16"/></g>`:`<text class="map-num" x="${x+10}" y="${y+28}">${String(LESSONS.indexOf(l)+1).padStart(2,'0')}</text>`}<text x="${x+34}" style="font-size:14px">${labels.map((line,j)=>`<tspan x="${x+34}" y="${y+(labels.length===1?28:18+j*18)}">${esc(line)}</tspan>`).join('')}</text></a>`;});});
 $('#knowledge-map').innerHTML=`<svg viewBox="0 0 ${width} ${start+Math.max(...GROUPS.map((_,i)=>LESSONS.filter(l=>l.group===i).length))*row+20}" role="img" aria-label="${LESSONS.length} 个 Kubernetes 主题；仅显示当前主题的直接关联，无方向，不代表执行顺序">${heads}${links}${cards}</svg>`;
}
function render(){theme();const n=LESSONS.indexOf(current)+1;$('#current-no').textContent=`${String(n).padStart(2,'0')} / ${LESSONS.length}`;$('#current-title').textContent=current.title;$('#scene-title').textContent=current.title;$('#scene-en').textContent=current.en;$('#scene-index').textContent=String(n).padStart(2,'0');$('#group-badge').textContent=`0${current.group+1} / ${GROUPS[current.group].name}`;$('#fault').innerHTML=`${icon('bolt')}<span>${esc(current.fault.name)}</span>`;$$('[data-group]').forEach(b=>b.classList.toggle('active',Number(b.dataset.group)===current.group));renderNav();renderStep();renderView();updateProgress();document.title=`${current.title} · K8s Systems Design`;}
document.addEventListener('click',e=>{if(e.target.closest('[data-copy-example]')){copyExample();return}const l=e.target.closest('[data-lesson],[data-related],[data-map]');if(l){e.preventDefault();select(l.dataset.lesson||l.dataset.related||l.dataset.map);return}const s=e.target.closest('[data-step],[data-trace]');if(s){goStep(Number(s.dataset.step??s.dataset.trace));return}const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;renderNav();return}const g=e.target.closest('[data-group]');if(g){select(LESSONS.find(l=>l.group===Number(g.dataset.group)).id);filter=g.dataset.group;renderNav();return}const d=e.target.closest('[data-detail]');if(d){detail=d.dataset.detail;renderDetail();return}if(e.target.closest('[data-about]'))$('#about-dialog').showModal();});
$('#search').addEventListener('input',e=>{query=e.target.value;renderNav()});$('#all-topics').onclick=()=>{filter='all';query='';$('#search').value='';renderNav()};
$('#normal').onclick=()=>{stop();fault=false;step=0;selectedNode=null;cueMotion();renderNav();renderStep()};$('#fault').onclick=()=>{stop();fault=true;step=0;selectedNode=null;cueMotion();renderNav();renderStep();};
$('#previous').onclick=()=>goStep(step-1);$('#next').onclick=()=>goStep(step+1);$('#play').onclick=play;$('#reset').onclick=()=>{stop();step=0;cueMotion();renderStep()};
$('#speed').onclick=()=>{const running=!!timer,previousMotion=motionMode;stop();speed=speed===.5?1:speed===1?1.5:speed===1.5?2:.5;$('#speed').textContent=`${speed}×`;if(running)play();else{motionMode=previousMotion;draw();}};
$('#theme').onclick=()=>{dark=!dark;theme();draw();if(view==='map')renderMap()};
$('#mechanism-tab').onclick=()=>{view='mechanism';diagramView='topology';$('#diagram').scrollTop=0;$('#diagram').scrollLeft=0;renderView();draw()};$('#sequence-tab').onclick=()=>{view='mechanism';diagramView='sequence';renderView();draw()};$('#map-tab').onclick=()=>{stop();view='map';renderView()};
$('#complete').onclick=()=>{if(completed.has(current.id))completed.delete(current.id);else completed.add(current.id);saveProgress();renderNav();renderMap();updateProgress()};
$('#about').onclick=()=>$('#about-dialog').showModal();$('#close-about').onclick=()=>$('#about-dialog').close();$('#clear-progress').onclick=()=>{completed.clear();saveProgress();renderNav();renderMap();updateProgress();$('#about-dialog').close();notify('本机学习进度已清除')};
$('#menu').onclick=()=>{const open=!$('#sidebar').classList.contains('open');$('#sidebar').classList.toggle('open',open);$('#shade').hidden=!open;$('#menu').setAttribute('aria-expanded',String(open))};$('#shade').onclick=closeMenu;
window.addEventListener('popstate',()=>select(location.hash.slice(1),false));window.addEventListener('hashchange',()=>{if(location.hash.slice(1)!==current.id)select(location.hash.slice(1),false)});
document.addEventListener('keydown',e=>{if($('#about-dialog').open)return;if(e.target.matches('input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='/'){e.preventDefault();if(innerWidth<=700){$('#sidebar').classList.add('open');$('#shade').hidden=false}$('#search').focus()}else if(e.key===' '&&!e.target.closest('button,a')){e.preventDefault();if(view==='mechanism')play()}else if(e.key==='ArrowRight'&&view==='mechanism'){e.preventDefault();goStep(step+1)}else if(e.key==='ArrowLeft'&&view==='mechanism'){e.preventDefault();goStep(step-1)}else if(e.key==='Escape'){if(expanded){toggleExpanded();return}stop();step=0;closeMenu();renderStep()}else if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-trace]')){e.preventDefault();goStep(Number(e.target.dataset.trace))}});
window.addEventListener('storage',e=>{if(e.key==='k8s-explorer-completed'){completed=readCompleted();updateProgress();renderNav();renderMap()}});
window.addEventListener('resize',()=>{draw()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
document.body.classList.toggle('no-motion',motionPreference.matches);
motionPreference.addEventListener('change',()=>{document.body.classList.toggle('no-motion',motionPreference.matches);draw();});
render();
