# Service 连通性排障 · 从集群内发起 HTTP 测试
# 前提：demo/web 存在；允许创建临时 Pod，并能拉取 busybox。若应用只允许特定来源，应使用真实调用方或匹配其策略身份。
# 预期：成功时可见 HTTP 响应；临时 Pod 的网络策略身份可能与真实调用方不同。
kubectl -n demo get service web -o yaml
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl -n demo run http-check --rm -i --restart=Never --image=busybox:1.37 -- wget -S -O- -T 5 http://web.demo.svc
