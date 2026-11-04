# Pod 与容器生命周期 · 读取上一次容器日志
# 前提：将 POD 替换为 demo 中有重启记录的 Pod，容器名假设为 web；首次未启动时没有 previous 日志。
# 预期：previous 日志来自上一实例；日志可因轮转或节点变化不可用，需与状态和事件互证。
POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo logs "$POD" -c web --previous --tail=100
