# StatefulSet 与稳定身份 · 检查有序创建进度
# 前提：已应用身份实验清单；如果所有副本健康，此命令只显示正常状态。
# 预期：对照 podManagementPolicy、readyReplicas 与首个 Pod 的事件。
kubectl -n demo get statefulset stable-web -o yaml
kubectl -n demo get pods -l app=stable-web
kubectl -n demo describe pod stable-web-0
