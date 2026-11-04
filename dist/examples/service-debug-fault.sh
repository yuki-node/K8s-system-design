# Service 连通性排障 · 先核对原始路径配置
# 前提：命令只检查配置；实际连接测试应在原调用方容器中使用其已有 HTTP 工具。
# 预期：把端点 IP、端口、就绪和来源策略逐项对照；不要把单个成功请求扩展为全路径结论。
kubectl -n demo get service web -o yaml
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl -n demo get networkpolicy
kubectl -n demo get pods -l app=web -o wide
