# Service 与 EndpointSlice · 检查服务与端点端口
# 前提：已应用入门实验；若配置正确则输出应一致。
# 预期：EndpointSlice 的 ports 应与应用实际监听吻合；应用日志无请求也可提示请求未抵达。
kubectl -n demo get service web -o yaml
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl -n demo logs deployment/web --tail=30
