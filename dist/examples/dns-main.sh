# 集群 DNS 与服务发现 · 在 Pod 内检查解析
# 前提：实验集群能拉取 busybox:1.37 且允许创建 Pod；命令结束后自动删除临时 Pod。
# 预期：核对 search 域和 nameserver；如果服务存在，查询应得到记录。网络策略可能影响 DNS 请求。
kubectl -n demo run dns-check --rm -i --restart=Never --image=busybox:1.37 -- sh -c 'cat /etc/resolv.conf; nslookup web; nslookup web.demo.svc'
