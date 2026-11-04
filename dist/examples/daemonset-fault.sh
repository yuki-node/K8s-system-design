# DaemonSet 与节点服务 · 检查覆盖差异
# 前提：已应用 node-demo 示例；节点污点与 Pod 是否存在需同时检查。
# 预期：对照节点范围、容忍与实际 Pod 的 NODE 列，区分资格与运行失败。
kubectl -n demo get daemonset node-demo -o wide
kubectl -n demo get pods -l app=node-demo -o wide
kubectl -n demo get daemonset node-demo -o yaml
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
