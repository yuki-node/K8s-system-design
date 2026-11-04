# RBAC 与最小权限 · 按具体子资源检查权限
# 前提：检查当前登录身份；如果使用 --as 测试示例 ServiceAccount，还需要模拟身份权限。
# 预期：can-i 反映当前身份与具体操作；管理员自己的 yes 不代表 pod-reader 也具备该权限。
kubectl auth can-i get pods -n demo
kubectl auth can-i get pods/log -n demo
kubectl -n demo get rolebindings
kubectl -n demo describe role pod-reader
