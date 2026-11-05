import React from 'react';
import { Box, top, project } from 'react-isokit';
import { componentModel } from './component-visuals.mjs';

function Slab({ w = 68, d = 42, h = 5, z = 0, className = '', children }) {
  return <Box className={`sculpt-slab ${className}`} x={-w/2} y={-d/2} z={z} w={w} d={d} h={h} r={1.5} top={children}/>;
}
function Cube({ x = 0, y = 0, z = 6, size = 16, h = 19 }) {
  return <Box className="sculpt-container" x={x} y={y} z={z} w={size} d={size} h={h} r={1}
    front={<path className="sculpt-detail" d={`M4 5v${h-9}m5-${h-9}v${h-9}`}/>}/>;
}
function Rack({ agent }) {
  const h = agent ? 35 : 49, w = agent ? 40 : 43;
  return <g transform="translate(0 9)">
    <Slab w={54} d={42} h={3}/>
    <Box className="sculpt-rack" x={-w/2} y={-16} z={3} w={w} d={32} h={h} r={1.5}
      top={<rect className="sculpt-inset" x="7" y="6" width={w-14} height="20" rx="1"/>}
      front={<>{(agent ? [6, 18] : [6, 18, 30]).map(y => <g key={y}>
        <rect className="sculpt-inset" x="5" y={y} width={w-10} height="9" rx="1"/>
        <path className="sculpt-detail" d={`M9 ${y+3}h13m-13 3h13`}/>
        <circle className="sculpt-led" cx={w-10} cy={y+4.5} r="1.3"/>
      </g>)}</>}
      side={<path className="sculpt-detail" d={`M7 7h17M7 11h17M7 ${h-9}h17M7 ${h-5}h17`}/>}/>
  </g>;
}
function Laptop({ monitor = false }) {
  return <g>
    <path className="sculpt-side" d="M-43-34 5-58 9-55 9-5-39 20-43 17Z"/>
    <path className="sculpt-front" d="M-39-31 9-55 9-5-39 20Z"/>
    <path className="sculpt-screen" d="M-34-28 4-47 4-10-34 9Z"/>
    {monitor ? <path className="sculpt-ink" d="m-29 0 7-13 7 4 6-14 8 1"/> : <path className="sculpt-ink" d="m-28-16 6 2-6 8m10 0 13-6"/>}
    <path className="sculpt-top" d="m-39 20 48-25 40 25L1 45Z"/>
    <path className="sculpt-side" d="M1 45 49 20v5L1 50Z"/>
    <path className="sculpt-front" d="m-39 20 40 25v5l-40-25Z"/>
    <path className="sculpt-inset" d="m-29 19 36-18 27 17L-2 36Z"/>
    <path className="sculpt-detail" d="m-20 16 27 17m-18-21 27 17m-18-21 27 17m-27-9 35-18m-27 23 35-18"/>
    <path className="sculpt-detail" d="m-10 33 10-5 12 7-10 5Z"/>
  </g>;
}
function Database() {
  return <g transform="translate(0 -2)">
    <path className="sculpt-side" d="M-31-29v46c0 8 14 15 31 15s31-7 31-15v-46Z"/>
    <ellipse className="sculpt-top" cy="-29" rx="31" ry="14"/>
    <ellipse className="sculpt-inset" cy="-29" rx="23" ry="9"/>
    {[-14,1,16].map(y => <path key={y} className="sculpt-crease" d={`M-31 ${y}c0 8 14 15 31 15s31-7 31-15`}/>)}
    <path className="sculpt-detail" d="M-22-13v9m0 7v9m0 7v6"/>
    {[-7,8,23].map(y=><circle className="sculpt-led" key={y} cx="18" cy={y} r="1.7"/>)}
  </g>;
}
function Pod() {
  return <g transform="translate(0 10)">
    <Slab w={65} d={51} h={4}/>
    <Cube x={-20} y={-13} size={18} h={23}/><Cube x={3} y={-10} size={18} h={23}/>
    <Box className="sculpt-pod-cage" x={-27} y={-22} z={4} w={54} d={44} h={35} r={2}/>
    <path className="sculpt-ink" d="M-42-14v-8l7-4M42-15v-8l-7-4M0 29v9m-5-3 5 3 5-3"/>
  </g>;
}
function Container() {
  return <g transform="translate(0 4)">
    <Box className="sculpt-runtime" x={-32} y={-18} z={0} w={64} d={36} h={30} r={1.5}
      front={<>{[8,18,28,38,48,58].map(x=><path key={x} className="sculpt-detail" d={`M${x} 5v20`}/>)}</>}
      top={<path className="sculpt-detail" d="M6 6h52M6 12h52M6 18h52M6 24h52M6 30h52"/>}
      side={<><rect className="sculpt-inset" x="5" y="5" width="26" height="21"/><path className="sculpt-detail" d="M18 5v21m-4-13v6m8-6v6"/></>}/>
  </g>;
}
function Replicas() {
  return <g transform="translate(0 12)">
    <Slab w={73} d={54} h={5}/>
    <Cube x={-9} y={-22} size={18} h={22}/>
    <Cube x={-29} y={3} size={18} h={22}/>
    <Cube x={12} y={3} size={18} h={22}/>
    <path className="sculpt-detail" d="M-44 14 0 39 45 14"/>
  </g>;
}
function Console({ scheduler = false }) {
  return <g transform="translate(0 8)">
    <Slab w={68} d={45} h={scheduler ? 9 : 18}>
      <rect className="sculpt-screen" x="10" y="7" width="48" height="30" rx="1"/>
      {scheduler ? <><path className="sculpt-ink" d="M34 12v8H19v9m15-9h15v9m-15-9v9"/>{[19,34,49].map(x=><rect key={x} className="sculpt-selected" x={x-4} y="28" width="8" height="5"/>)}</>
        : <><circle className="sculpt-ink" cx="34" cy="22" r="9"/><path className="sculpt-ink" d="M34 10v5m0 14v5M22 22h5m14 0h5m-18-8 4 4m8 8 4 4m0-16-4 4m-8 8-4 4"/></>}
    </Slab>
    {!scheduler && <g transform={top(-34,22.5,18)}><circle className="sculpt-led" cx="12" cy="4" r="2"/><path className="sculpt-detail" d="M22 4h12m5 0h16"/></g>}
  </g>;
}
function Router() {
  const [x,y] = project(12,1,20);
  return <g transform="translate(0 5)">
    <Box className="sculpt-router" x={-35} y={-18} z={0} w={70} d={36} h={20} r={2}
      top={<path className="sculpt-detail" d="M14 11h22m-22 6h22m-22 6h22"/>}
      front={<>{[8,22,36,50].map(x=><rect key={x} className="sculpt-inset" x={x} y="6" width="9" height="8"/>)}<circle className="sculpt-led" cx="64" cy="10" r="1.5"/></>}
      side={<path className="sculpt-detail" d="M6 6h23M6 10h23M6 14h23"/>}/>
    <path className="sculpt-ink" d={`M${x} ${y}v-31`}/><circle className="sculpt-top" cx={x} cy={y-32} r="2.5"/>
  </g>;
}
function Globe() {
  return <g>
    <path className="sculpt-side" d="M-19 23h38l12 7-31 18-31-18Z"/>
    <path className="sculpt-ink" d="M0 9v18"/>
    <circle className="sculpt-side" cx="4" cy="-15" r="27"/>
    <circle className="sculpt-front" cy="-18" r="27"/>
    <ellipse className="sculpt-ink" cy="-18" rx="12" ry="27"/>
    <ellipse className="sculpt-ink" cy="-18" rx="27" ry="10"/>
    <path className="sculpt-detail" d="M0-45v54M-27-18h54"/>
  </g>;
}
function Documents() {
  return <g transform="translate(0 5)">
    {[0,6,12].map(z=><Slab key={z} w={57} d={43} h={2} z={z} className="sculpt-paper"/>)}
    <g transform={top(-28.5,-21.5,14)}><path className="sculpt-detail" d="M10 10h36M10 17h36M10 24h36M10 31h22"/></g>
  </g>;
}
function Shield() {
  return <g transform="translate(0 -7)">
    <path className="sculpt-side" d="m-22-26 27-13 26 14v23c0 16-11 28-26 41l-6-3Z"/>
    <path className="sculpt-front" d="m-28-29 27-13 26 14v23c0 16-11 28-26 41C-16 27-28 17-28 1Z"/>
    <path className="sculpt-inset" d="m-20-23 19-9 18 10v19c0 11-7 21-18 31-12-8-19-17-19-28Z"/>
    <path className="sculpt-ink" d="m-11-2 9 9 15-23"/>
  </g>;
}
function Enclosure() {
  return <g transform="translate(0 10)">
    <Slab w={72} d={52} h={4}/><Cube x={-20} y={-12}/><Cube x={6} y={3}/>
    <Box className="sculpt-pod-cage" x={-36} y={-26} z={4} w={72} d={52} h={23} r={1}/>
  </g>;
}
const MODELS = { laptop: Laptop, rack: Rack, agent: ()=><Rack agent/>, database: Database,
  pod: Pod, container: Container, replicas: Replicas, console: Console,
  scheduler: ()=><Console scheduler/>, router: Router, globe: Globe,
  monitor: ()=><Laptop monitor/>, documents: Documents, shield: Shield, enclosure: Enclosure };

export function IsometricComponent({ visual }) {
  const model = componentModel(visual), Model = MODELS[model];
  return <g className="isometric-component" data-model={model} data-dimensionality="isometric">
    <path className="sculpt-shadow" d="M-41 20 8-8 60 22 11 49Z"/>
    <g className="sculpture-lift"><g className="sculpture-body" transform="translate(0 -11) scale(.82)"><Model/>
      {visual.source === 'kubernetes' && <g className="sculpt-badge" transform="translate(34 19)">
        <circle r="15"/><image className="component-artwork" href={`./assets/kubernetes/${visual.icon}.svg`} x="-12" y="-12" width="24" height="24"/>
      </g>}
    </g></g>
  </g>;
}
