# 声明式 API 与对象 · 预检清单并观察结果
# 前提：已下载入门实验清单为 lab.yaml；server dry-run 需要相应权限及支持 dry-run 的准入组件。
# 预期：diff 退出码 1 表示存在差异；rollout status 的成功是 Deployment 进度检查，不替代业务验收。
kubectl apply --dry-run=server -f lab.yaml
kubectl diff -f lab.yaml
kubectl apply -f lab.yaml
kubectl -n demo rollout status deployment/web --timeout=120s
