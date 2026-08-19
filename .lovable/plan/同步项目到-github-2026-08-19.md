# 同步项目到 GitHub

## 当前状态
- 项目代码已保存在 Lovable 内部仓库（`origin` 和 `secondary`）。
- 尚未连接到 GitHub 仓库，因此无法直接通过命令行推送。

## 操作步骤

1. 在 Lovable 编辑器中连接 GitHub
   - 点击左下角聊天输入框旁的 **Plus (+) 菜单**。
   - 选择 **GitHub → Connect project**。
   - 授权 Lovable GitHub App 访问你的 GitHub 账号。
   - 选择要同步到的 GitHub 账号 / 组织。
   - 点击 **Create Repository**，Lovable 会自动创建仓库并推送当前代码。

2. 启用双向同步
   - 连接成功后，Lovable 会自动开启实时双向同步：
     - 在 Lovable 中的修改会自动推送到 GitHub。
     - 从 GitHub 推送的修改也会自动同步回 Lovable。
   - 后续无需手动 `git push`。

## 注意事项
- 目前 Lovable 不支持直接导入已有的 GitHub 仓库；如果目标仓库已存在，需要先在 Lovable 创建新仓库，再迁移代码。
- 数据库数据需要单独导出：Cloud → Advanced settings → Export data。

## 验证方式
- 连接完成后，访问生成的 GitHub 仓库地址，确认最新提交与当前项目一致。
