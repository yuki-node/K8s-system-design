# 标签与选择器 · 把选择器与端点对起来
# 前提：已应用 lab.yaml；Service web 选择 app=web。
# 预期：核对 selector、Pod 标签、端点 targetRef 和 ready 条件；不能仅比较资源名字。
kubectl -n demo get service web -o yaml
kubectl -n demo get pods -l app=web --show-labels
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
