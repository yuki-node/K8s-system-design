import React, { useLayoutEffect, useRef, useState } from 'react';
import { IsometricComponent } from './isometric-component.jsx';
import { COMPONENT_VISUALS } from './component-visuals.mjs';
import { INTRO_CHAPTERS } from './intro-content.mjs';

function Unit({ x, y, type, label, sub, status }) {
  return <g className={'intro-unit ' + (status || '')} transform={'translate(' + x + ' ' + y + ')'}>
    <g className="intro-unit-art" aria-hidden="true">
      <IsometricComponent visual={{ ...COMPONENT_VISUALS[type], id: type }} singleContainer/>
    </g>
    <text className="intro-unit-name" textAnchor="middle" y="55">{label}</text>
    {sub && <text className="intro-unit-sub" textAnchor="middle" y="76">{sub}</text>}
  </g>;
}
function Link({ d, control = false, muted = false }) {
  return <path className={'intro-link' + (control ? ' control' : '') + (muted ? ' muted' : '')}
    d={d} markerEnd={muted ? undefined : 'url(#intro-arrow)'}/>;
}
function Website({ pods }) {
  const ys = pods.length === 2 ? [100, 255] : [65, 175, 285];
  return <>
    <text className="intro-diagram-label" x="24" y="29">集群内的访问</text>
    <Unit x={65} y={175} type="terminal" label="客户端"/>
    <Unit x={235} y={175} type="service" label="web Service" sub="稳定的入口"/>
    <Link d="M112 170H182"/>
    {pods.map((pod, i) => <g key={pod.id} data-intro-pod={pod.id} data-status={pod.status}>
      <Link d={'M286 170H325V' + (ys[i] - 4) + 'H374'} muted={pod.status !== 'ready'}/>
      <Unit x={425} y={ys[i]} type="pod" label={'web-' + pod.id}
        sub={pod.status === 'ready' ? 'Ready · 接收请求' : pod.status === 'pending' ? '等待就绪' : '故障 · 不接收请求'} status={pod.status}/>
    </g>)}
  </>;
}
function IntroIllustration({ chapter, pods }) {
  return <svg className="intro-illustration" viewBox="0 0 520 380" role="img"
    aria-label={INTRO_CHAPTERS[chapter].caption}>
    <defs><marker id="intro-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M0 0 7 3.5 0 7Z" fill="var(--accent)"/>
    </marker></defs>
    {chapter === 0 && <>
      <text className="intro-diagram-label" x="24" y="29">把一个网站运行起来</text>
      <Unit x={90} y={180} type="document" label="web:v1" sub="镜像 · 应用与依赖"/>
      <Link d="M143 175H202V105H310"/><Link d="M202 175V260H310"/>
      <Unit x={380} y={110} type="runtime" label="容器 A" sub="独立的运行实例"/>
      <Unit x={380} y={265} type="runtime" label="容器 B" sub="来自同一个镜像"/>
    </>}
    {chapter === 1 && <>
      <rect className="intro-region" x="22" y="55" width="213" height="282"/>
      <rect className="intro-region" x="253" y="55" width="245" height="282"/>
      <text className="intro-diagram-label" x="38" y="83">手动管理</text>
      <text className="intro-diagram-label" x="269" y="83">Kubernetes</text>
      <Unit x={124} y={160} type="terminal" label="逐个操作"/>
      <Unit x={370} y={160} type="controller" label="持续协调"/>
      <text className="intro-diagram-note" x="124" y="278" textAnchor="middle">启动 / 补副本 / 更新</text>
      <text className="intro-diagram-note" x="370" y="278" textAnchor="middle">声明目标 → 观察 → 调整</text>
    </>}
    {chapter === 2 && <>
      <rect className="intro-region" x="15" y="15" width="490" height="345"/>
      <text className="intro-diagram-label" x="32" y="45">一个 Kubernetes 集群</text>
      <Unit x={260} y={110} type="inspect" label="控制平面" sub="管理目标与决策"/>
      <Link d="M260 195V214H140V234" control/><Link d="M260 214H390V234" control/>
      <Unit x={140} y={275} type="node" label="工作节点 A" sub="运行应用"/>
      <Unit x={390} y={275} type="node" label="工作节点 B" sub="运行应用"/>
    </>}
    {chapter === 3 && <>
      <text className="intro-diagram-label" x="24" y="29">一个网站 Pod 的例子</text>
      <rect className="intro-region" x="63" y="67" width="394" height="271"/>
      <text className="intro-diagram-label" x="85" y="97">Pod · 一个共同的运行单元</text>
      <g transform="translate(260 218) scale(1.6)" aria-hidden="true">
        <IsometricComponent visual={{ ...COMPONENT_VISUALS.pod, id: 'pod' }} singleContainer/>
      </g>
      <text className="intro-unit-name" x="260" y="296" textAnchor="middle">web:v1 容器</text>
      <text className="intro-unit-sub" x="260" y="321" textAnchor="middle">同一 Pod 中的容器共享网络</text>
    </>}
    {chapter === 4 && <>
      <text className="intro-diagram-label" x="24" y="29">目标：保持两个网站副本</text>
      <Unit x={120} y={180} type="deployment" label="web Deployment" sub="replicas: 2"/>
      <Link d="M179 175H250V97H326" control/><Link d="M250 175V258H326" control/>
      <Unit x={395} y={103} type="pod" label="web-a" sub="一个 Pod 副本" status="ready"/>
      <Unit x={395} y={263} type="pod" label="web-b" sub="一个 Pod 副本" status="ready"/>
    </>}
    {(chapter === 5 || chapter === 6) && <Website pods={chapter === 6 ? pods : [{ id: 'a', status: 'ready' }, { id: 'b', status: 'ready' }]}/>}
  </svg>;
}

const initialPods = () => [{ id: 'a', status: 'ready' }, { id: 'b', status: 'ready' }];
export function BeginnerIntro({ chapter, onChapterChange, onSelectLesson }) {
  const content = INTRO_CHAPTERS[chapter];
  const [pods, setPods] = useState(initialPods), [desired, setDesired] = useState(2);
  const [serial, setSerial] = useState(2);
  const [notice, setNotice] = useState('网站有两个就绪副本。先试试扩容，或模拟一个 Pod 故障。');
  const pending = pods.some(p => p.status === 'pending'), failed = pods.some(p => p.status === 'failed');
  const ready = pods.filter(p => p.status === 'ready').length;
  const controls = useRef(null), moveFocus = useRef(false);
  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    controls.current?.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
  }, [pending, failed]);
  function runAction(event, action) {
    moveFocus.current = event.currentTarget === document.activeElement;
    action();
  }
  function scale() {
    setDesired(3); setSerial(serial + 1);
    setPods([...pods, { id: String(serial + 1), status: 'pending' }]);
    setNotice('期望副本改为 3，新 Pod 已创建。它尚未就绪，Service 仍只使用原来的两个就绪后端。');
  }
  function fail() {
    setPods(pods.map((p, i) => i === pods.length - 1 ? { ...p, status: 'failed' } : p));
    setNotice('一个 Pod 已故障并退出就绪后端，期望副本数保持不变。接下来观察控制器如何补足副本。');
  }
  function recover() {
    setSerial(serial + 1);
    setPods(pods.map(p => p.status === 'failed' ? { id: String(serial + 1), status: 'pending' } : p));
    setNotice('故障 Pod 被移除，控制器请求了新身份的替代 Pod。新 Pod 仍需启动并通过就绪检查。');
  }
  function makeReady() {
    setPods(pods.map(p => p.status === 'pending' ? { ...p, status: 'ready' } : p));
    setNotice('就绪检查通过，新 Pod 加入 Service 后端。就绪副本数现在与期望副本数一致。');
  }
  function reset() { setPods(initialPods()); setDesired(2); setSerial(2); setNotice('已重置：两个网站副本均已就绪。'); }
  return <div className="intro-guide">
    <header className="intro-toolbar"><span>00 / KUBERNETES 入门</span><span>约 8-10 分钟</span>
      <a href="#architecture" onClick={e => { e.preventDefault(); onSelectLesson('architecture'); }}>跳过导读，进入课程 ↗</a></header>
    <div className="intro-reading" key={chapter}>
      <div className="intro-chapter-meta"><span>从 Docker 到 Kubernetes</span><span>{String(chapter + 1).padStart(2, '0')} / 07</span></div>
      <div className="intro-spread">
        <div className="intro-copy">
          <h1 id="intro-title" tabIndex={-1}>{content.title}</h1>
          <p className="intro-lead">{content.lead}</p>
          {content.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <div className="intro-takeaway"><strong>先记住这一点</strong><p>{content.takeaway}</p></div>
          <a className="intro-source" href={content.source[1]} target="_blank" rel="noopener noreferrer">官方文档 · {content.source[0]} ↗</a>
        </div>
        <figure className="intro-figure"><IntroIllustration {...{ chapter, pods }}/><figcaption>{content.caption}</figcaption>
          {chapter === 6 && <div className="intro-demo">
            <div className="intro-demo-counts"><span>期望副本 <b data-intro-desired>{desired}</b></span><span>就绪副本 <b data-intro-ready>{ready}</b></span><small>教学模拟</small></div>
            <div className="intro-demo-controls" ref={controls}>
              <button onClick={event => runAction(event, scale)} disabled={desired === 3 || pending || failed}>扩容到 3 个副本</button>
              <button onClick={event => runAction(event, fail)} disabled={pending || failed}>模拟一个 Pod 故障</button>
              {failed && <button className="intro-action" onClick={event => runAction(event, recover)}>协调创建替代 Pod</button>}
              {pending && <button className="intro-action" onClick={event => runAction(event, makeReady)}>就绪检查通过</button>}
              <button onClick={reset}>重置</button>
            </div>
            <p className="intro-demo-status" role="status">{notice}</p>
          </div>}
        </figure>
      </div>
      {chapter === 6 && <div className="intro-onward">
        <h2>接下来，拆开看每一个机制</h2>
        <div>{[['architecture', '集群架构与组件'], ['pod', 'Pod 与容器生命周期'], ['deployment', 'Deployment 与滚动发布'], ['service', 'Service 与 EndpointSlice']].map(([id, name]) =>
          <a key={id} href={'#' + id} onClick={e => { e.preventDefault(); onSelectLesson(id); }}>{name} ↗</a>)}</div>
        <p>想在真实环境试一试？先准备<a href="https://kubernetes.io/zh-cn/docs/setup/learning-environment/" target="_blank" rel="noopener noreferrer">学习集群</a>，再下载<a href="./examples/lab.yaml" download="lab.yaml">入门实验 lab.yaml</a>。</p>
      </div>}
    </div>
    <footer className="intro-footer">
      <button onClick={() => onChapterChange(chapter - 1)} disabled={chapter === 0}>← 上一节</button>
      <nav aria-label="导读小节">{INTRO_CHAPTERS.map((c, i) => <button key={c.short} aria-label={'导读 ' + (i + 1) + '：' + c.short}
        aria-current={chapter === i ? 'step' : undefined} onClick={() => onChapterChange(i)}><span>{String(i + 1).padStart(2, '0')}</span><i/></button>)}</nav>
      <button className="intro-action" onClick={() => chapter === 6 ? onSelectLesson('architecture') : onChapterChange(chapter + 1)}>{content.next} →</button>
    </footer>
  </div>;
}
