# 集群 DNS 与服务发现 · 核对服务所在空间
# 前提：demo/web Service 存在；此命令不创建 frontend 命名空间，只检查目标。
# 预期：先确认服务所在空间，再从实际调用方环境重复解析，避免在错误空间验证。
kubectl get services -A
kubectl -n demo get service web
kubectl -n demo run dns-cross-check --rm -i --restart=Never --image=busybox:1.37 -- nslookup web.demo.svc
