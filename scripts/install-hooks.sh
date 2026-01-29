#!/bin/bash
# Git Hooks 安装脚本
#
# 用途：自动安装 pre-commit hook 到 .git/hooks/
#
# 使用方法：
#   bash scripts/install-hooks.sh

set -e

echo "🔧 安装 Git Hooks..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查是否在 Git 仓库中
if [ ! -d .git ]; then
    echo "❌ 错误：当前目录不是 Git 仓库根目录"
    echo "💡 请在项目根目录运行此脚本"
    exit 1
fi

# 创建 hooks 目录（如果不存在）
mkdir -p .git/hooks

# 安装 pre-commit hook
echo "📝 安装 pre-commit hook..."
ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo -e "${GREEN}✅ Git Hooks 安装完成！${NC}"
echo ""
echo "📋 已安装的 Hooks："
echo "   - pre-commit: 提交前检查（禁止'已移除'注释等）"
echo ""
echo "🔍 测试 Hook："
echo "   尝试提交一个包含'❌ 已移除'注释的文件，查看 Hook 是否阻止提交"
echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo "   - Hooks 已经安装，每次提交会自动运行"
echo "   - 如需跳过检查，使用：git commit --no-verify"
echo "   - 如需卸载 Hooks，删除 .git/hooks/pre-commit 即可"
echo ""
