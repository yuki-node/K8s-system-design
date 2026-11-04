# 备份、恢复与升级 · 盘点卷与业务依赖
# 前提：需要相应只读权限；命令不读取 Secret 值，不做恢复，不验证备份内容。
# 预期：将资源清单与存储后端及应用备份记录对应；kubectl 列表不能替代后端数据恢复测试。
kubectl get pvc -A
kubectl get pv
kubectl get statefulsets -A
kubectl get storageclasses
