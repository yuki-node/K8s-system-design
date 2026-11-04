# 控制循环与自愈 · 观察期望与实际副本
# 前提：已应用 lab.yaml，demo/web Deployment 目标为 2；这里只观察，不主动制造故障。
# 预期：Deployment、ReplicaSet 与 Pod 是不同资源；最后一条持续观察，可按 Ctrl+C 结束。
kubectl -n demo get deployment web
kubectl -n demo get replicasets
kubectl -n demo get pods -l app=web -w
