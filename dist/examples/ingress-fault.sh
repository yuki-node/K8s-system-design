# Ingress 与 Gateway API · 检查入口前提
# 前提：已有 demo/web Ingress；get pods -A 需要相应权限，控制器名称与命名空间依安装方式而异。
# 预期：最后一条帮助确认 Gateway API 资源是否已安装，不意味着某个实现已工作。
kubectl get ingressclass
kubectl -n demo describe ingress web
kubectl get pods -A
kubectl api-resources --api-group=gateway.networking.k8s.io
