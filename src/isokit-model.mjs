// Fixed layout for four logical participants. Boxes are illustrative, not physical hosts.
export const POSITIONS = [[155, 78], [505, 78], [505, 292], [155, 292]];
export const VIEW_BOX = '0 0 660 420';
const COS30 = Math.sqrt(3) / 2;

export function toWorld([x, y]) {
  return [y + x / (2 * COS30), y - x / (2 * COS30), 0];
}

export function routeBetween(from, to) {
  if (from === to) return null;
  const [x1, y1] = POSITIONS[from], [x2, y2] = POSITIONS[to];
  const firstSide = x1 < 330 ? 1 : -1;
  const lastSide = x2 < 330 ? 1 : -1;
  const start = [x1 + firstSide * 102, y1 - 8];
  const end = [x2 + lastSide * 102, y2 - 8];
  if (y1 === y2) return [start, end];
  return [start, [330, start[1]], [330, end[1]], end];
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

export function illustrationFor(name) {
  if (/队列|缓冲|Outbox|就绪集合/.test(name)) return 'queue';
  if (/校验|检查|规范|权限|锁状态|监控|模型|控制器|调度|规则|准入|策略|探针|Service|Ingress|Gateway|PDB|API|RBAC|HPA|readiness|liveness|startup|MMU|TLB/.test(name)) return 'control';
  if (/日志|存储|数据库|磁盘|快照|ConfigMap|Secret|PVC|PV|etcd|数据页|版本链|检查点|记录|页面|索引|内存|主存|DRAM|缓存|页表/.test(name)) return 'storage';
  if (/CPU|线程|Worker|Pod|kubelet|CRI|kubectl|节点|应用|容器|任务|事务|Leader|Follower|客户端|服务端|执行|处理|消费|转发|回调/.test(name)) return 'compute';
  return 'record';
}
