import React from 'react';
import { IsometricComponent } from './isometric-component.jsx';

// Teaching symbols for concepts without an exact official resource icon. They use
// neutral outlines, so they cannot be mistaken for Kubernetes API resource badges.
function TeachingGlyph({ kind }) {
  if (kind === 'terminal') return <><rect x="-29" y="-25" width="58" height="39" rx="4"/><path d="m-18-13 8 7-8 7M-4 1h17M-36 22h72l-6 6h-60Z"/></>;
  if (kind === 'runtime' || kind === 'registry') return <><path d="m0-29 29 16v31L0 34l-29-16v-31ZM-29-13 0 4l29-17M0 4v30M-15-21 14-4v30"/>{kind === 'registry' && <path d="M-35-29h70M-35-35v12m70-12v12"/>}</>;
  if (kind === 'dns') return <><circle cy="-14" r="15"/><path d="M-15-14h30M0-29c-10 10-10 20 0 30m0-30c10 10 10 20 0 30M0 1v12M-25 23V13h50v10"/><rect x="-33" y="23" width="16" height="12" rx="2"/><rect x="17" y="23" width="16" height="12" rx="2"/></>;
  if (kind === 'metrics') return <><path d="M-29-29v57h59M-20 16V4h9v12m8 0v-28h9v28m8 0v-43h9v43M-20-16l13-8 13 3 18-14"/></>;
  if (kind === 'plugin') return <><rect x="-24" y="-23" width="48" height="46" rx="6"/><path d="M-12-23v-11m24 11v-11M-12 23v11m24-11v11M-24-10h-11m11 20h-11m59-20h11M24 10h11m-47-10h14m18 0h14m-25-7-7 7 7 7m4-14 7 7-7 7"/></>;
  if (kind === 'logs') return <><rect x="-28" y="-32" width="56" height="64" rx="4"/><path d="M-17-19h5m8 0h20M-17-5h5m8 0h20M-17 9h5m8 0h20M-17 23h5m8 0h13"/></>;
  if (kind === 'probe') return <><circle r="31"/><path d="M-31 0h14l7-13L0 15 10-5l6 5h15"/></>;
  if (kind === 'security') return <><path d="m0-34 28 11v23c0 16-13 27-28 35C-15 27-28 16-28 0v-23ZM-13 0l9 10 19-23"/></>;
  if (kind === 'routing') return <><rect x="-33" y="-12" width="20" height="24" rx="3"/><rect x="15" y="-33" width="20" height="22" rx="3"/><rect x="15" y="12" width="20" height="22" rx="3"/><path d="M-13 0H0v-22h15M0 0v23h15m-6-29 6-6-6-6m0 35 6 6-6 6"/></>;
  if (kind === 'inspect') return <><circle cx="-5" cy="-6" r="23"/><path d="m12 11 21 22M-17-6l8 8L8-15"/></>;
  return <><path d="M-23-32H8l15 15v49h-46ZM8-32v15h15M-13-4h26M-13 9h26M-13 22H3"/></>;
}

export function ComponentGlyph({ visual, status, active, compact = false }) {
  const official = visual.source === 'kubernetes';
  return <g className={`component-symbol ${official ? 'official-symbol' : 'teaching-symbol'}`}
    data-icon={visual.id} data-icon-source={visual.source} aria-hidden="true">
    {active && !compact && <ellipse className="component-focus" cy="24" rx="49" ry="13"/>}
    {!compact ? <IsometricComponent visual={visual}/> : official
      ? <image className="component-artwork" href={`./assets/kubernetes/${visual.icon}.svg`} x="-36" y="-44" width="72" height="72"/>
      : <g className="concept-artwork" transform="translate(0 -8) scale(.83)"><TeachingGlyph kind={visual.icon}/></g>}
    {status && !compact && <g className={`component-status status-${status}`} transform="translate(-34 22)">
      <circle r="10"/>
      {status === 'ready' ? <path d="m-5 0 3 3 7-7"/> : status === 'removed' || status === 'failed'
        ? <path d="m-3-3 6 6m0-6-6 6"/> : status === 'running'
          ? <path d="m-2-4 6 4-6 4Z"/> : <path d="M0-5v5l3 2"/>}
    </g>}
  </g>;
}
