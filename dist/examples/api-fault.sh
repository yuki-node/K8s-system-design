# 声明式 API 与对象 · 查询字段约束
# 前提：kubectl 能访问集群 OpenAPI；把待检查 Deployment 清单保存为 deployment.yaml。
# 预期：命令显示字段说明；无效清单会返回校验错误，不创建资源。
kubectl explain deployment.spec.selector
kubectl explain deployment.spec.template
kubectl apply --dry-run=server -f deployment.yaml
