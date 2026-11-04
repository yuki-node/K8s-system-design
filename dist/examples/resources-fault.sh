# 资源请求与限制 · 确认 OOM 线索
# 前提：POD 为异常 Pod；top 需要 Metrics Server，采样也可能错过峰值。
# 预期：lastState、事件与历史指标应共同判断；重启后的当前内存不能代表崩溃前峰值。
POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo logs "$POD" --previous --tail=100
kubectl -n demo top pod "$POD" --containers
