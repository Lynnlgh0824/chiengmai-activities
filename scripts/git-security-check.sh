#!/bin/bash

# ==========================================
# Git 安全检查脚本
# ==========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 统计变量
issues_found=0

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Git 数据安全检查${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# 1. 检查 .gitignore 文件
echo -e "${BLUE}1️⃣  检查 .gitignore 配置...${NC}"

if [ ! -f .gitignore ]; then
    echo -e "${RED}❌ 未找到 .gitignore 文件${NC}"
    ((issues_found++))
else
    echo -e "${GREEN}✅ .gitignore 文件存在${NC}"

    # 检查关键项
    critical_patterns=(".env" "*.key" "*.pem" "credentials.json" "*.jks" "*.keystore")

    for pattern in "${critical_patterns[@]}"; do
        if grep -q "^${pattern}" .gitignore || grep -q "^${pattern}[/*]" .gitignore; then
            echo -e "${GREEN}   ✓ $pattern 已忽略${NC}"
        else
            echo -e "${YELLOW}   ⚠️  建议忽略: $pattern${NC}"
        fi
    done
fi
echo ""

# 2. 检查当前暂存区是否有敏感文件
echo -e "${BLUE}2️⃣  检查暂存区...${NC}"

staged_files=$(git diff --cached --name-only)
if [ -n "$staged_files" ]; then
    echo -e "${YELLOW}暂存文件：${NC}"
    echo "$staged_files"

    # 检查是否有敏感文件
    sensitive_count=0
    while IFS= read -r file; do
        if [[ "$file" =~ \.env$ ]] || \
           [[ "$file" =~ \.key$ ]] || \
           [[ "$file" =~ \.pem$ ]] || \
           [[ "$file" =~ credentials ]] || \
           [[ "$file" =~ secrets ]]; then
            echo -e "${RED}❌ 警告：敏感文件 $file 即将被提交！${NC}"
            ((sensitive_count++))
            ((issues_found++))
        fi
    done <<< "$staged_files"

    if [ $sensitive_count -eq 0 ]; then
        echo -e "${GREEN}✅ 暂存区未发现敏感文件${NC}"
    fi
else
    echo -e "${GREEN}✅ 暂存区为空${NC}"
fi
echo ""

# 3. 扫描代码中的潜在敏感信息
echo -e "${BLUE}3️⃣  扫描代码中的敏感信息...${NC}"

# 搜索模式
patterns=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "api_key\s*=\s*['\"][^'\"]+['\"]"
    "apikey\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "private_key"
    "access_token"
    "refresh_token"
)

scan_results=0
for pattern in "${patterns[@]}"; do
    # 排除 node_modules 和 .git
    results=$(grep -r "$pattern" --include="*.js" --include="*.ts" --include="*.json" \
              --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | wc -l)

    if [ "$results" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  发现 '$pattern' 相关内容: $results 处${NC}"
        ((scan_results++))
        # 显示前3个结果
        grep -r "$pattern" --include="*.js" --include="*.ts" --include="*.json" \
             --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | head -3 | while read -r line; do
            echo -e "   ${YELLOW}→ $line${NC}"
        done
    fi
done

if [ "$scan_results" -eq 0 ]; then
    echo -e "${GREEN}✅ 未发现明显的敏感信息硬编码${NC}"
else
    echo -e "${YELLOW}💡 建议：检查上述内容是否应该使用环境变量${NC}"
fi
echo ""

# 4. 检查是否有未提交的 .env 文件
echo -e "${BLUE}4️⃣  检查 .env 文件...${NC}"

env_files=$(find . -maxdepth 2 -name ".env*" -type f 2>/dev/null | grep -v node_modules)
if [ -n "$env_files" ]; then
    echo -e "${YELLOW}发现的 .env 文件：${NC}"
    echo "$env_files"

    # 检查是否被追踪
    while IFS= read -r file; do
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            echo -e "${RED}❌ 警告：$file 已被 Git 追踪！${NC}"
            echo -e "${RED}   建议立即从历史记录中删除${NC}"
            ((issues_found++))
        else
            echo -e "${GREEN}✅ $file 未被追踪（安全）${NC}"
        fi
    done <<< "$env_files"
else
    echo -e "${GREEN}✅ 未发现 .env 文件${NC}"
fi
echo ""

# 5. 检查 Git 历史记录中的敏感文件
echo -e "${BLUE}5️⃣  检查 Git 历史记录...${NC}"

sensitive_in_history=$(git log --all --full-history --source -- \
    "*.env" "*.env.local" "*.env.*" "*.key" "*.pem" "credentials.json" \
    "secrets/" "secret.key" 2>/dev/null | wc -l)

if [ "$sensitive_in_history" -gt 0 ]; then
    echo -e "${RED}❌ 警告：历史记录中可能包含敏感文件！${NC}"
    echo -e "${YELLOW}💡 如需清理，请使用 git-filter-repo 或 BFG Repo-Cleaner${NC}"
    ((issues_found++))
else
    echo -e "${GREEN}✅ 历史记录检查通过${NC}"
fi
echo ""

# 6. 检查远程仓库配置
echo -e "${BLUE}6️⃣  检查远程仓库配置...${NC}"

remote_url=$(git config --get remote.origin.url 2>/dev/null)
if [ -n "$remote_url" ]; then
    echo -e "${GREEN}远程仓库：${NC}$remote_url"

    if [[ "$remote_url" =~ github\.com ]] || [[ "$remote_url" =~ gitlab\.com ]]; then
        if [[ "$remote_url" =~ ^https://github\.com/.*\.git$ ]]; then
            echo -e "${GREEN}✅ 使用 HTTPS 连接${NC}"
        elif [[ "$remote_url" =~ ^git@github\.com:.*\.git$ ]]; then
            echo -e "${GREEN}✅ 使用 SSH 连接${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  未配置远程仓库${NC}"
fi
echo ""

# 7. 检查 Git 配置安全设置
echo -e "${BLUE}7️⃣  检查 Git 安全配置...${NC}"

# 检查凭证存储
credential_helper=$(git config --get credential.helper)
if [ -n "$credential_helper" ]; then
    echo -e "${YELLOW}凭证助手：$credential_helper${NC}"
    if [[ "$credential_helper" == "store" ]]; then
        echo -e "${RED}❌ 警告：'store' 凭证助手会明文保存密码！${NC}"
        ((issues_found++))
    fi
else
    echo -e "${GREEN}✅ 未配置凭证助手（或使用系统默认）${NC}"
fi

# 检查签名配置
signing_key=$(git config --get user.signingkey)
if [ -n "$signing_key" ]; then
    commit_sign=$(git config --get commit.gpgsign)
    if [ "$commit_sign" = "true" ]; then
        echo -e "${GREEN}✅ GPG 签名已启用${NC}"
    fi
else
    echo -e "${YELLOW}💡 建议：配置 GPG 签名以增强安全性${NC}"
fi
echo ""

# 总结
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}检查总结${NC}"
echo -e "${BLUE}==========================================${NC}"

if [ $issues_found -eq 0 ]; then
    echo -e "${GREEN}🎉 未发现严重安全问题！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  发现 $issues_found 个安全问题需要处理${NC}"
    echo ""
    echo -e "${YELLOW}建议操作：${NC}"
    echo "1. 检查并修复上述问题"
    echo "2. 运行: git status 查看当前状态"
    echo "3. 如需清除历史记录中的敏感信息，使用:"
    echo "   git filter-repo --invert-paths --path 敏感文件路径"
    exit 1
fi
