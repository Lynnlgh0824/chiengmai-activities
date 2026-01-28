# Git 数据安全最佳实践

> 保护你的代码和敏感数据不被泄露
>
> 更新时间：2026-01-29

## 📋 目录

- [安全风险概述](#安全风险概述)
- [核心安全原则](#核心安全原则)
- [敏感文件管理](#敏感文件管理)
- [Git 历史记录清理](#git-历史记录清理)
- [访问权限控制](#访问权限控制)
- [自动化安全检查](#自动化安全检查)
- [紧急事件响应](#紧急事件响应)

---

## 安全风险概述

### 常见安全问题

1. **敏感信息泄露**
   - API 密钥、密码、token 被提交到代码库
   - 数据库连接字符串
   - 第三方服务凭证
   - 私钥、证书文件

2. **历史记录污染**
   - 敏感文件即使被删除，仍存在于 Git 历史中
   - 可通过 `git log` 或 `git reflog` 恢复

3. **访问权限失控**
   - 私有仓库被意外公开
   - 协作者权限过高
   - 凭证管理不当

### 安全检查工具

项目提供了自动化安全检查脚本：

```bash
# 运行完整的安全检查
./scripts/git-security-check.sh
```

该脚本会检查：
- .gitignore 配置
- 暂存区敏感文件
- 代码中的硬编码敏感信息
- Git 历史记录中的敏感文件
- 远程仓库配置
- Git 安全设置

---

## 核心安全原则

### 1. 永不提交敏感信息

```bash
# ❌ 错误示例
const apiKey = "sk_live_abc123xyz789";
const dbPassword = "myPassword123";

# ✅ 正确示例
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

### 2. 使用环境变量

创建 `.env` 文件（在 .gitignore 中）：

```bash
# .env
API_KEY=your_api_key_here
DB_PASSWORD=your_db_password
SECRET_KEY=your_secret_key
```

创建 `.env.example` 作为模板：

```bash
# .env.example
API_KEY=your_api_key_here
DB_PASSWORD=your_db_password
SECRET_KEY=your_secret_key
```

在代码中读取：

```javascript
// 使用 dotenv
require('dotenv').config();

const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

### 3. 最小权限原则

- 只给协作者必要的权限
- 定期审查和撤销不需要的访问权限
- 为不同的环境使用不同的凭证

---

## 敏感文件管理

### 必须忽略的文件类型

确保 `.gitignore` 包含以下内容：

```gitignore
# ==========================================
# 敏感配置文件（最重要！）
# ==========================================
.env
.env.local
.env.production
.env.development
.env.*.local
*.pem
*.key
*.crt
*.jks
*.keystore
credentials.json
service-account.json
secrets/

# ==========================================
# 数据和备份
# ==========================================
*.sql
*.sqlite
*.db
data/
backups/
```

### 检查文件是否被追踪

```bash
# 检查特定文件
git ls-files | grep .env

# 检查所有敏感文件
git ls-files | grep -E "\.(env|key|pem|jks)$"
```

### 停止追踪已提交的敏感文件

```bash
# 从 Git 中删除，但保留本地文件
git rm --cached .env

# 从历史记录中完全删除
git filter-repo --invert-paths --path .env

# 强制推送到远程（谨慎使用！）
git push origin --force
```

---

## Git 历史记录清理

### 检查历史记录中的敏感信息

```bash
# 搜索包含敏感信息的提交
git log --all --source --full-history -- "*password*"

# 查看特定文件的所有版本
git log --all --full-history -- .env

# 在所有提交中搜索文本
git grep "password" $(git rev-list --all)
```

### 清理工具

#### 方法 1：git-filter-repo（推荐）

```bash
# 安装
pip install git-filter-repo

# 清理特定文件
git filter-repo --invert-paths --path .env

# 清理特定目录
git filter-repo --invert-paths --path secrets/

# 清理后强制推送
git push origin --force
```

#### 方法 2：BFG Repo-Cleaner

```bash
# 下载并安装
# https://rtyley.github.io/bfg-repo-cleaner/

# 删除特定文件
bfg --delete-files .env

# 替换文件中的文本（如密码）
bfg --replace-text passwords.txt

# 清理后
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force
```

#### 方法 3：git filter-branch（不推荐）

```bash
# 从所有提交中删除文件
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 清理和回收空间
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### ⚠️ 清理历史记录的注意事项

1. **备份重要**：清理前创建完整备份
2. **通知团队**：所有协作者需要重新克隆仓库
3. **强制推送**：会重写历史，可能影响他人
4. **检查 PR**：清理前检查是否有开放的 PR

---

## 访问权限控制

### GitHub 仓库设置

#### 私有 vs 公开

```bash
# 检查当前仓库可见性
gh repo view --json visibility,owner

# 修改为私有
gh repo edit --visibility private
```

#### 协作者管理

```bash
# 列出所有协作者
gh api repos/:owner/:repo/collaborators

# 添加协作者
gh api -X PUT repos/:owner/:repo/collaborators/:username

# 移除协作者
gh api -X DELETE repos/:owner/:repo/collaborators/:username
```

#### 分支保护

```bash
# 设置主分支保护
gh api -X PUT repos/:owner/:repo/branches/main/protection \
  --field required_status_checks='[]' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null
```

### 访问令牌安全

#### 使用个人访问令牌（PAT）

1. 在 GitHub 设置中生成 PAT
2. 设置最小权限范围
3. 定期轮换令牌
4. 不要在代码中硬编码

```bash
# 使用令牌克隆
git clone https://TOKEN@github.com/username/repo.git
```

#### 使用 SSH 密钥

```bash
# 生成 SSH 密钥（推荐使用 ed25519）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到 ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 添加公钥到 GitHub
cat ~/.ssh/id_ed25519.pub
```

---

## 自动化安全检查

### Pre-commit Hook

创建 `.git/hooks/pre-commit`：

```bash
#!/bin/bash

# 检查是否尝试提交 .env 文件
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    against=HEAD
else
    # 初始提交
    against=4b825dc642cb6eb9a060e54bf8d69288fbee4904
fi

# 检查敏感文件
git diff --cached --name-only | grep -E "\.env$|\.key$|\.pem$" && {
    echo "❌ 错误：尝试提交敏感文件！"
    echo "这些文件应该被 .gitignore 忽略"
    exit 1
}

# 检查硬编码的敏感信息
git diff --cached | grep -E "^\+.*password\s*=\s*['\"][^'\"]+['\"]" && {
    echo "❌ 警告：检测到可能的硬编码密码"
    exit 1
}

exit 0
```

```bash
# 设置为可执行
chmod +x .git/hooks/pre-commit
```

### 使用 git-secrets

```bash
# macOS
brew install git-secrets

# 配置规则
git secrets --install
git secrets --register-aws

# 添加自定义规则
git secrets --add 'password\s*=\s*.+'
git secrets --add 'api[_-]?key\s*=\s*.+'

# 扫描历史记录
git secrets --scan-history

# 扫描仓库
git secrets --scan
```

### 持续集成检查

在 CI/CD 流程中添加安全检查：

```yaml
# .github/workflows/security-check.yml
name: Security Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 获取完整历史

      - name: Run security scan
        run: |
          # 安装 git-secrets
          wget https://github.com/awslabs/git-secrets/archive/refs/tags/1.3.0.tar.gz
          tar -xzf 1.3.0.tar.gz
          cd git-secrets-1.3.0
          make install

          # 配置并扫描
          git secrets --install
          git secrets --register-aws
          git secrets --scan-history
```

---

## 紧急事件响应

### 发现敏感信息泄露后的处理流程

#### 步骤 1：立即行动

```bash
# 1. 防止进一步传播
git remote set-url origin /dev/null  # 暂时禁用远程

# 2. 撤销最近的提交（如果刚刚提交）
git reset --soft HEAD^
```

#### 步骤 2：评估影响

- 确定泄露的信息类型（API 密钥、密码、证书等）
- 确定泄露的时间范围（哪些提交）
- 确定谁可能访问了这些信息

#### 步骤 3：撤销凭证

```bash
# 1. 轮换所有泄露的凭证
# - API 密钥
# - 数据库密码
# - 访问令牌
# - SSH 密钥

# 2. 在服务提供商处撤销旧凭证
# - GitHub
# - AWS/Azure/GCP
# - 数据库提供商
```

#### 步骤 4：清理 Git 历史

```bash
# 使用 git-filter-repo
git filter-repo --invert-paths --path .env

# 或使用 BFG
bfg --delete-files .env

# 强制推送
git push origin --force
```

#### 步骤 5：通知相关人员

- 团队成员：重新克隆仓库
- 服务提供商：报告泄露事件
- 用户：如果影响用户数据，发布安全公告

#### 步骤 6：预防再次发生

```bash
# 配置 pre-commit hooks
git secrets --install

# 添加安全检查到 CI
# 更新 .gitignore
# 团队培训
```

### 事件响应检查清单

- [ ] 立即撤销泄露的凭证
- [ ] 评估泄露范围和影响
- [ ] 清理 Git 历史
- [ ] 通知所有相关人员
- [ ] 更新文档和流程
- [ ] 实施额外的安全措施
- [ ] 进行事后分析
- [ ] 更新安全策略

---

## 日常安全最佳实践

### 每次提交前

```bash
# 1. 查看将要提交的内容
git diff --staged

# 2. 运行安全检查
./scripts/git-security-check.sh

# 3. 确认无误后提交
git commit -m "feat: 添加新功能"
```

### 定期维护

```bash
# 每月检查一次
- 审查协作者权限
- 轮换 API 密钥和令牌
- 运行完整安全扫描
- 更新依赖包

# 每季度检查一次
- 审查所有仓库可见性
- 检查是否有未使用的令牌
- 更新安全策略文档
```

### 团队协作安全

1. **代码审查**
   - 所有代码必须经过审查
   - 检查是否有硬编码的敏感信息
   - 使用自动化工具辅助审查

2. **分支策略**
   - 使用功能分支，不直接提交到主分支
   - 启用分支保护
   - 要求 PR 审查才能合并

3. **培训和教育**
   - 定期安全培训
   - 分享安全最佳实践
   - 建立安全文化

---

## 工具和资源

### 推荐工具

| 工具 | 用途 | 链接 |
|------|------|------|
| git-secrets | 扫描 Git 历史中的敏感信息 | https://github.com/awslabs/git-secrets |
| git-filter-repo | 清理 Git 历史 | https://github.com/newren/git-filter-repo |
| BFG Repo-Cleaner | 快速清理大文件和敏感数据 | https://rtyley.github.io/bfg-repo-cleaner/ |
| truffleHog | 扫描密钥和密码 | https://github.com/trufflesecurity/trufflehog |
| gitleaks | 密钥扫描器 | https://github.com/zricethezav/gitleaks |

### 相关文档

- [Git 安全最佳实践](https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection)
- [GitHub 安全指南](https://docs.github.com/en/security)
- [OWASP Git 安全备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Git_Security_Cheat_Sheet.html)

---

## 快速参考

### 安全检查命令

```bash
# 运行项目安全检查
./scripts/git-security-check.sh

# 检查 .gitignore
git check-ignore -v .env

# 搜索历史记录
git log --all --source -- "*secret*"

# 扫描当前文件
git grep "password"
```

### 紧急命令

```bash
# 撤销最后一次提交
git reset --soft HEAD^

# 删除敏感文件（保留本地）
git rm --cached .env

# 清理历史（使用 git-filter-repo）
git filter-repo --invert-paths --path .env

# 强制推送（谨慎使用！）
git push origin --force
```

---

**记住：安全是一个持续的过程，不是一次性的配置。定期检查和更新你的安全实践！**
