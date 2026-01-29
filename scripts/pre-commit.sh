#!/bin/bash
# Pre-commit Hook - 自动化检查"已移除"注释
#
# 安装方法：
# 1. 将此文件复制到 .git/hooks/pre-commit
# 2. 添加执行权限：chmod +x .git/hooks/pre-commit
#
# 或使用 symbolic link（推荐）：
# ln -s ../../scripts/pre-commit.sh .git/hooks/pre-commit

set -e

echo "🔍 运行 Pre-commit 检查..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 1: 是否有"已移除"注释
echo ""
echo "📋 检查 1/3: 查找'已移除'注释..."
REMOVED_COMMENTS=$(grep -r "❌.*已移除\|deprecated\|Deprecated" public/ 2>/dev/null || true)

if [ -n "$REMOVED_COMMENTS" ]; then
    echo -e "${RED}❌ 发现'已移除'注释：${NC}"
    echo "$REMOVED_COMMENTS"
    echo ""
    echo "📖 请参考以下文档："
    echo "   - docs/removed-components.md（记录已移除组件）"
    echo "   - CHECKLIST.md（代码审查检查清单）"
    echo ""
    echo "💡 解决方案："
    echo "   1. 删除所有'已移除'注释"
    echo "   2. 将历史信息记录到 docs/removed-components.md"
    echo "   3. 只保留'为什么这样做'的设计说明注释"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ 通过：没有'已移除'注释${NC}"
fi

# 检查 2: 是否有被注释掉的代码块
echo ""
echo "📋 检查 2/3: 查找被注释掉的代码块..."
COMMENTED_CODE=$(grep -r "^[[:space:]]*\/\*.*\*\/[[:space:]]*$" public/ 2>/dev/null | grep -v "Copyright\|License\|MIT" || true)

# 检查是否有大块的注释代码（超过 3 行）
MULTILINE_COMMENT=$(awk '
/\/\*/ {
    block = 1
    count = 0
    next
}
/\*\// {
    if (block == 1 && count > 5) {
        print FILENAME ":" NR ": 发现大块注释代码（" count " 行）"
    }
    block = 0
    count = 0
    next
}
{
    if (block == 1) count++
}
' $(find public/ -name "*.html" -o -name "*.js" -o -name "*.css") 2>/dev/null || true)

if [ -n "$MULTILINE_COMMENT" ]; then
    echo -e "${YELLOW}⚠️  发现大块注释代码（>5 行）：${NC}"
    echo "$MULTILINE_COMMENT"
    echo ""
    echo "💡 如果这些注释是'已移除代码'，请删除。"
    echo "💡 如果是重要说明，请保留。"
else
    echo -e "${GREEN}✅ 通过：没有可疑的大块注释${NC}"
fi

# 检查 3: 是否有 console.log 或 debugger
echo ""
echo "📋 检查 3/3: 查找 console.log 和 debugger..."
CONSOLE_STATEMENTS=$(grep -rn "console\.log\|debugger" public/ 2>/dev/null | grep -v "安全检查\|Git 安全" || true)

if [ -n "$CONSOLE_STATEMENTS" ]; then
    echo -e "${YELLOW}⚠️  发现 console.log 或 debugger：${NC}"
    echo "$CONSOLE_STATEMENTS"
    echo ""
    echo "💡 生产环境不应该有 console.log 和 debugger"
    echo "💡 请删除或改为 console.warn / console.error"
else
    echo -e "${GREEN}✅ 通过：没有 console.log 或 debugger${NC}"
fi

# 检查 4: 文件大小限制（可选）
echo ""
echo "📋 检查 4/4: 检查文件大小..."
LARGE_FILES=$(find public/ -type f -name "*.html" -size +500k 2>/dev/null || true)

if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  发现大文件（>500KB）：${NC}"
    echo "$LARGE_FILES"
    echo ""
    echo "💡 建议拆分大文件或优化代码"
else
    echo -e "${GREEN}✅ 通过：文件大小正常${NC}"
fi

# 所有检查通过
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Pre-commit 检查全部通过！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📝 提示："
echo "   - 如果此 Hook 阻止了合法提交，可以使用 --no-verify 跳过："
echo "     git commit --no-verify -m 'message'"
echo "   - 但不推荐这样做，请先修复检查出的问题"
echo ""
exit 0
