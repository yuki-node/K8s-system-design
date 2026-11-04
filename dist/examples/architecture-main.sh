# 集群架构与组件 · 观察控制面与节点
# 前提：需要可访问的实验集群；托管集群可能不展示控制面 Pod，不能据此判断组件缺失。
# 预期：节点列表显示状态与版本；demo Pod 的 NODE 列可与调度结果对应。
kubectl cluster-info
kubectl get nodes -o wide
kubectl -n kube-system get pods
kubectl -n demo get pods -o wide
