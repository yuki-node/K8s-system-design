import React from 'react';
import { Box, Glow, Plate, path } from 'react-isokit';
import { POSITIONS, VIEW_BOX, routeBetween, truncateRoute, toWorld, labelLines, illustrationFor } from './isokit-model.mjs';
import { TravelDot } from './travel-dot.jsx';

function FaceMark({ kind }) {
  if (kind === 'compute') return <>
    <rect className="iso-symbol" x="32" y="17" width="32" height="28" rx="5" />
    <path className="iso-symbol" d="M38 12v5m10-5v5m10-5v5M38 45v5m10-5v5m10-5v5M27 23h5m-5 14h5m32-14h5m-5 14h5" />
    <rect className="iso-symbol-core" x="40" y="25" width="16" height="12" rx="2" />
  </>;
  if (kind === 'queue') return <>
    <rect className="iso-symbol" x="23" y="16" width="50" height="32" rx="7" />
    <path className="iso-symbol" d="M33 32h30m-9-8 9 8-9 8" />
  </>;
  if (kind === 'storage') return <>
    <rect className="iso-symbol" x="26" y="16" width="44" height="32" rx="5" />
    <path className="iso-symbol" d="M34 25h28M34 33h28M34 41h15" />
  </>;
  if (kind === 'control') return <>
    <circle className="iso-symbol" cx="48" cy="31" r="17" />
    <path className="iso-symbol" d="M48 20v12m0 0-9 9m9-9 9 9" />
  </>;
  return <>
    <path className="iso-symbol" d="M32 14h22l10 10v26H32ZM54 14v12h10M39 34h17M39 42h17" />
  </>;
}

function LogicalModule({ name, index, active, local }) {
  const [x, y] = POSITIONS[index], kind = illustrationFor(name), labels = labelLines(name);
  return <g className={`logical-node iso-node ${active ? 'node-current' : ''}`} data-node={index}
    data-illustration={kind} transform={`translate(${x} ${y})`}>
    <title>{`${name} · 逻辑节点示意`}</title>
    <rect className="iso-label-bounds" x="-133" y="-80" width="266" height="206" fill="none" stroke="none" />
    <g className="iso-object">
    <ellipse className="iso-shadow" cx="0" cy="34" rx="83" ry="24" />
    <Box className="iso-base" x={-54} y={-38} z={-8} w={108} d={76} h={5} r={9} />
    {kind === 'storage' && <Box className="iso-layer" x={-48} y={-32} z={0} w={96} d={64} h={7} r={7} />}
    <Box className="iso-body" x={-48} y={-32} z={kind === 'storage' ? 9 : 0}
      w={96} d={64} h={kind === 'record' ? 9 : kind === 'storage' ? 12 : 24} r={8}
      top={<FaceMark kind={kind} />}
      front={<>
        <path className="ik-detail" d="M15 7h39" />
        <Glow on={active}><circle className={active ? 'ik-dot' : 'iso-idle-dot'} cx="80" cy="8" r="2.4" /></Glow>
      </>} />
    </g>
    {active && !local && <g className="iso-port">
      <path d={`M${x < 330 ? 78 : -78} -8H${x < 330 ? 102 : -102}`} />
      <circle cx={x < 330 ? 102 : -102} cy="-8" r="4" />
    </g>}
    <text className="iso-node-number" x="-106" y="-52">{String(index + 1).padStart(2, '0')}</text>
    {local && active && <g className="iso-local-mark" transform="translate(106 -52)">
      <circle r="10" /><circle r="3" />
    </g>}
    <text className="logical-label iso-node-label" textAnchor="middle">
      {labels.map((line, i) => <tspan key={i} x="0" y={labels.length === 1 ? 86 : labels.length === 2 ? 82 + i * 27 : 65 + i * 24}>{line}</tspan>)}
    </text>
  </g>;
}

export function MechanismScene({ label, nodes, frame, playing, motionMode = playing ? 'playing' : 'paused', motionVersion = 0, speed, stageKey, reducedMotion, dark }) {
  const [, from, to, , , , kind] = frame;
  const lost = kind === 'lost', rejected = kind === 'reject' || lost;
  const transfer = kind === 'request' || kind === 'data';
  const fullRoute = routeBetween(from, to);
  const route = fullRoute && (lost ? truncateRoute(fullRoute) : fullRoute);
  const routeWorld = route?.map(toWorld);
  const marker = kind === 'compare' ? undefined : rejected ? 'url(#iso-reject)' : 'url(#iso-arrow)';
  return <Plate className="systems-iso" label={label} role="img" credit={false}
    viewBox={VIEW_BOX} theme={dark ? 'dark' : 'light'} data-kind={kind} data-renderer="react-isokit"
    data-stage={stageKey} data-playing={playing ? 'true' : 'false'}>
    <defs>
      <marker id="iso-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0 0 7 3.5 0 7Z" fill="var(--accent)" />
      </marker>
      <marker id="iso-reject" markerWidth="10" markerHeight="12" refX="5" refY="6" orient="auto">
        <path d="M2 2L8 10M8 2L2 10" fill="none" stroke="var(--fault)" strokeWidth="2" />
      </marker>
    </defs>
    {route && <g className="iso-connection">
      <path className="iso-wire-underlay" d={path(routeWorld)} />
      <path id="active-path" data-kind={kind} data-from={from} data-to={to}
        className={`semantic-edge ${transfer ? 'transfer' : 'logical'} ${rejected ? 'rejected' : ''}`}
        d={path(routeWorld)} markerEnd={marker} />
    </g>}
    {nodes.map((name, index) => <LogicalModule key={index} name={name} index={index}
      active={index === from || (!lost && index === to)} local={kind === 'local'} />)}
    {transfer && !reducedMotion && <TravelDot points={route} duration={Math.round(2200 / speed)}
      mode={motionMode} motionKey={`${stageKey}:${motionVersion}`} />}
  </Plate>;
}
