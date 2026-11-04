# ConfigMap 与 Secret · 比较配置对象与容器输出
# 前提：已应用 config.yaml；此处只读取非机密 ConfigMap，不打印 Secret。
# 预期：对照 MODE 环境注入、文件挂载与日志；未更新对象时两者应相同。
kubectl -n demo get configmap app-config -o yaml
kubectl -n demo logs config-reader --tail=20
kubectl -n demo get pod config-reader -o yaml
