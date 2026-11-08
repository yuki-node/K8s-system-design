import React from 'react';
import { Plate, path } from 'react-isokit';
import { topologyLayout, routeBetween, truncateRoute, toWorld, labelLines } from './isokit-model.mjs';
import { TravelDot } from './travel-dot.jsx';
import { componentVisual } from './component-visuals.mjs';
import { ComponentGlyph } from './component-glyph.jsx';

const nodeLabelLines = name => /^[A-Za-z]+[ -]?控/.test(name) ? name.split(' ') : labelLines(name, 18);
const STATUS = { pending: '待创建 / 启动', running: 'Running', ready: 'Ready', failed: '不满足条件', removed: '已退出' };

function LogicalModule({ name, index, position, active, local, status, selected, onInspect, effectKey }) {
  const [x, y] = position, visual = componentVisual(name), labels = nodeLabelLines(name);
  return <g className={`logical-node iso-node ${active ? 'node-current' : ''} ${selected ? 'node-selected' : ''}`}
    data-node={index} data-status={status || 'observed'} data-illustration={visual.id} transform={`translate(${x} ${y})`}
    role="button" tabIndex={0} aria-label={`${name}${status ? ' · ' + STATUS[status] : ''}，查看相关阶段`}
    aria-pressed={selected} onClick={() => onInspect?.(index)}
    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onInspect?.(index); } }}>
    <title>{`${name} · 点击查看相关阶段`}</title>
    <rect className="node-hit" x="-76" y="-58" width="152" height="134" rx="5" />
    <g className="iso-object">
      <ComponentGlyph visual={visual} status={status} active={active}/>
    </g>
    <text className="iso-node-number" x="-66" y="-39">{String(index + 1).padStart(2, '0')}</text>
    {local && active && <g key={effectKey} className="iso-local-mark" transform="translate(58 -32)"><circle className="local-ring" r="10" /><circle r="3" /></g>}
    <text className="logical-label iso-node-label" textAnchor="middle">
      {labels.map((line, i) => <tspan key={i} x="0" y={49 + i * 21}>{line}</tspan>)}
    </text>
    {status && <text className="node-status" textAnchor="middle" y={49 + labels.length * 21}>{STATUS[status]}</text>}
  </g>;
}

const sequenceWidth = count => Math.max(720, count * 120 + 74);

function SequenceScene({ label, nodes, frames, frameIndex, onSelectStep, dark, referenceScene, mainScene }) {
  const participantSlots = Math.max(nodes.length, mainScene?.nodes.length ?? 0);
  const width = sequenceWidth(participantSlots), height = 129 + frames.length * 57;
  const referenceWidth = sequenceWidth(referenceScene?.nodes.length ?? nodes.length);
  const laneSpacing = (width - 145) / Math.max(1, participantSlots - 1);
  const x = index => 92 + index * laneSpacing;
  return <Plate className="systems-iso sequence-plate" label={label} role="group" credit={false}
    viewBox={`0 0 ${width} ${height}`} theme={dark ? 'dark' : 'light'} data-renderer="react-isokit" data-view="sequence"
    style={{ '--sequence-ratio': `${width} / ${height}`, width: `max(${width}px, ${100 * width / referenceWidth}%)`, minWidth: 0 }}>
    <defs><marker id="sequence-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 6 3 0 6" fill="var(--accent)" /></marker></defs>
    {nodes.map((name, index) => <g key={index}>
      <g transform={`translate(${x(index)} 25) scale(.5)`}><ComponentGlyph visual={componentVisual(name)} compact/></g>
      <text className="sequence-name" x={x(index)} y="66" textAnchor="middle">{nodeLabelLines(name).map((line, i) => <tspan key={i} x={x(index)} dy={i ? 17 : 0}>{line}</tspan>)}</text>
      <path className="sequence-lifeline" d={`M${x(index)} 98V${height - 12}`} />
    </g>)}
    {frames.map((frame, index) => {
      const y = 125 + index * 57, [title, from, to, event, , state, kind] = frame;
      const local = kind === 'local', rejected = kind === 'reject' || kind === 'lost';
      const endX = kind === 'lost' ? (x(from) + x(to)) / 2 : x(to);
      return <g key={index} className={`sequence-row ${index === frameIndex ? 'current' : ''}`} data-sequence-step={index}
        role="button" tabIndex={0} aria-current={index === frameIndex ? 'step' : undefined} aria-label={`步骤 ${index + 1}：${title}；${state}`}
        onClick={() => onSelectStep?.(index)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onSelectStep?.(index); } }}>
        <rect className="sequence-row-hit" x="0" y={y - 23} width={width} height="55" />
        <text className="sequence-number" x="16" y={y + 4}>{String(index + 1).padStart(2, '0')}</text>
        <path className={`sequence-message ${rejected ? 'rejected' : ''} ${['control', 'check', 'compare'].includes(kind) ? 'logical' : ''}`}
          d={local ? `M${x(from)} ${y - 6}h28v18h-28` : `M${x(from)} ${y}H${endX}`}
          markerEnd={local || kind === 'compare' || rejected ? undefined : 'url(#sequence-arrow)'} />
        {rejected && <text className="sequence-reject" x={endX} y={y + 5}>×</text>}
        <text className="sequence-event" x={Math.min(x(from), endX) + 8} y={y - 8}>{event}</text>
      </g>;
    })}
  </Plate>;
}

export function MechanismScene({ label, nodes, frame, frames = [frame], frameIndex = 0, groups, milestones = [],
  playing, motionMode = playing ? 'playing' : 'paused', motionVersion = 0, speed = 1, stageKey,
  reducedMotion, dark, viewMode = 'topology', referenceScene, mainScene, selectedNode, onInspectNode, onSelectStep }) {
  if (viewMode === 'sequence') return <SequenceScene {...{ label, nodes, frames, frameIndex, onSelectStep, dark, referenceScene, mainScene }} />;
  const phaseTime = 1760 / speed;
  const layout = topologyLayout(nodes, groups);
  const reference = referenceScene ? topologyLayout(referenceScene.nodes, referenceScene.groups) : layout;
  const referenceWidth = Math.max(layout.width, reference.width);
  const referenceHeight = Math.max(layout.height, reference.height);
  const firstRegion = layout.regions[0];
  const lastRegion = layout.regions[layout.regions.length - 1];
  const contentWidth = lastRegion.x + lastRegion.width - firstRegion.x;
  const viewBox = `${firstRegion.x} 0 ${contentWidth} ${referenceHeight}`;
  const [, from, to, , , , kind] = frame;
  const lost = kind === 'lost', rejected = kind === 'reject' || lost;
  const transfer = kind === 'request' || kind === 'data';
  const fullRoute = routeBetween(from, to, layout.positions);
  const route = fullRoute && (lost ? truncateRoute(fullRoute) : fullRoute);
  const marker = kind === 'compare' ? undefined : rejected ? 'url(#iso-reject)' : 'url(#iso-arrow)';
  const statuses = {};
  for (const milestone of milestones) if (milestone.step <= frameIndex) statuses[milestone.node] = milestone.status;
  const connections = [...new Map(frames.filter(s => s[1] !== s[2]).map(s => [s[1] + ':' + s[2], [s[1], s[2]]])).values()];
  return <Plate className="systems-iso topology-plate" label={label} role="group" credit={false}
    viewBox={viewBox} theme={dark ? 'dark' : 'light'} data-kind={kind} data-renderer="react-isokit"
    data-stage={stageKey} data-playing={playing ? 'true' : 'false'} data-motion={motionMode} data-reduced={reducedMotion ? 'true' : 'false'}
    style={{
      '--phase-time': `${phaseTime}ms`,
      '--topology-width-ratio': contentWidth / referenceWidth,
      '--topology-height-ratio': contentWidth / referenceHeight,
    }}>
    <defs>
      <marker id="iso-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7Z" fill="var(--accent)" /></marker>
      <marker id="iso-reject" markerWidth="10" markerHeight="12" refX="5" refY="6" orient="auto"><path d="M2 2L8 10M8 2L2 10" fill="none" stroke="var(--fault)" strokeWidth="2" /></marker>
    </defs>
    {layout.regions.map((group, i) => <g className="topology-region" key={i}>
      <rect x={group.x} y="18" width={group.width} height={layout.height - 32} rx="5" />
      <text x={group.x + 14} y="44">{group.label}<tspan className="region-count" dx="8">/ {group.nodes.length}</tspan></text>
    </g>)}
    {connections.map(([a, b]) => <path key={`${a}:${b}`} className="context-edge" d={path(routeBetween(a, b, layout.positions).map(toWorld))} />)}
    {route && <g className="iso-connection">
      <path className="iso-wire-underlay" d={path(route.map(toWorld))} />
      <path key={stageKey} id="active-path" data-kind={kind} data-from={from} data-to={to}
        className={`semantic-edge ${transfer ? 'transfer' : 'logical'} ${rejected ? 'rejected' : ''}`}
        d={path(route.map(toWorld))} markerEnd={marker} />
    </g>}
    {nodes.map((name, index) => <LogicalModule key={index} name={name} index={index} position={layout.positions[index]}
      active={index === from || (!lost && index === to)} local={kind === 'local' || kind === 'check'}
      status={statuses[index]} selected={selectedNode === index} onInspect={onInspectNode} effectKey={`${stageKey}:${motionVersion}`} />)}
    {transfer && route && !reducedMotion && <TravelDot points={route} duration={Math.round(phaseTime)} mode={motionMode} motionKey={`${stageKey}:${motionVersion}`} />}
  </Plate>;
}
