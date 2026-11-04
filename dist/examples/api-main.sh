# 声明式 API 与对象 · 预检清单并观察结果
# 前提：已下载入门实验清单为 lab.yaml。第一行会创建或更新 demo 命名空间；服务端预检不会创建它，因此须先完成该准备。需要相应权限及支持 dry-run 的准入组件。
# 预期：diff 退出码 1 表示存在差异；rollout status 的成功是 Deployment 进度检查，不替代业务验收。
kubectl create namespace demo --dry-run=client -o yaml | kubectl apply -f -
kubectl apply --dry-run=server -f lab.yaml
kubectl diff -f lab.yaml
kubectl apply -f lab.yaml
kubectl -n demo rollout status deployment/web --timeout=120s
