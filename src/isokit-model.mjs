// Layout follows participant groups. Each group has one or two columns, with clear routing gutters.
export function topologyLayout(nodes, groups) {
  const bands = groups?.length ? groups : [{ label: '场景参与者', nodes: nodes.map((_, i) => i) }];
  const positions = [], regions = [];
  let left = 20, rows = 1;
  for (const group of bands) {
    const columns = group.nodes.length > 3 ? 2 : 1;
    const countRows = Math.ceil(group.nodes.length / columns);
    const width = columns * 166 + 24;
    group.nodes.forEach((node, i) => { positions[node] = [left + 12 + (i % columns + .5) * 166, 118 + Math.floor(i / columns) * 142]; });
    regions.push({ ...group, x: left, width });
    left += width + 24;
    rows = Math.max(rows, countRows);
  }
  const height = 80 + rows * 142;
  return { positions, regions, width: left - 4, height, viewBox: `0 0 ${left - 4} ${height}` };
}
const COS30 = Math.sqrt(3) / 2;
export function toWorld([x, y]) {
  return [y + x / (2 * COS30), y - x / (2 * COS30), 0];
}
export function routeBetween(from, to, positions) {
  if (from === to) return null;
  const [x1, y1] = positions[from], [x2, y2] = positions[to];
  if (x1 === x2) return [[x1 + 54, y1], [x1 + 76, y1], [x2 + 76, y2], [x2 + 54, y2]];
  const direction = Math.sign(x2 - x1);
  const start = [x1 + direction * 55, y1 - 8], end = [x2 - direction * 55, y2 - 8];
  // Route between rows through the gap above nodes, never across participant labels.
  if (y1 === y2 && Math.abs(x2 - x1) < 230) return [start, end];
  const channel = Math.min(y1, y2) - 64;
  return [start, [x1 + direction * 76, start[1]], [x1 + direction * 76, channel],
    [x2 - direction * 76, channel], [x2 - direction * 76, end[1]], end];
}

export function pathLength(points) {
  return points.slice(1).reduce((n, p, i) => n + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);
}

export function truncateRoute(points, fraction = 0.5) {
  let remaining = pathLength(points) * fraction;
  const output = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (remaining < length) {
      output.push([a[0] + (b[0] - a[0]) * remaining / length, a[1] + (b[1] - a[1]) * remaining / length]);
      return output;
    }
    output.push(b);
    remaining -= length;
  }
  return output;
}

export function labelLines(text, max = 18) {
  const lines = [];
  let line = '', units = 0;
  const tokens = text.match(/[A-Za-z0-9_=./+\-]+|[^\x00-\x7F]|\s+|./gu) || [];
  for (const token of tokens) {
    const width = [...token].reduce((n, ch) => n + (/[^\x00-\x7F]/.test(ch) ? 2 : 1), 0);
    if (units + width > max && line.trim()) { lines.push(line.trim()); line = ''; units = 0; }
    if (!line && /^\s+$/.test(token)) continue;
    line += token; units += width;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}
