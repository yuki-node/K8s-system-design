# 控制循环与自愈 · 分清创建失败与调度失败
# 前提：已部署 demo/web；若存在配额问题，ReplicaSet 事件比不存在的 Pod 更有诊断价值。
# 预期：FailedCreate 表示创建环节失败；没有配额对象时 describe 会提示没有资源。
kubectl -n demo describe deployment web
kubectl -n demo describe replicasets
kubectl -n demo describe resourcequota
