# 标签与选择器 · 查看匹配集合
# 前提：已有 demo/web Service；标签选择查询为空时先核对源清单，不直接修改所有 Pod 标签。
# 预期：错误 selector 的查询为空；模板标签与实际 Pod 标签可交叉核对。
kubectl -n demo get pods -l app=weeb
kubectl -n demo get pods --show-labels
kubectl -n demo get deployment web -o yaml
