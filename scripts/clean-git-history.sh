#!/bin/bash

################################################################################
# Git历史清理脚本 - 使用git filter-repo
# 功能：彻底清理Git历史中的敏感信息
# 警告：此操作会重写Git历史，请谨慎使用
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Git历史清理 - git filter-repo"
echo "=========================================="
echo ""

echo "⚠️  警告：此操作将重写Git历史"
echo "⚠️  如果多人协作，需要通知所有成员"
echo ""
echo "建议在执行前："
echo "  1. 备份当前仓库"
echo "  2. 通知所有协作者"
echo "  3. 确认要清理的内容"
echo ""
echo "=========================================="
echo ""

read -p "是否继续？(输入 'yes' 确认): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ 操作已取消"
    exit 0
fi

echo ""
echo "=========================================="
echo "执行历史清理"
echo "=========================================="
echo ""

# 方法1: 清理docs/internal-archive/的历史（最安全）
echo "方法1: 清理docs/internal-archive/的历史..."
git filter-repo --force --index \
  --path "docs/internal-archive/" \
  --invert

echo ""
echo "方法2: 清理特定文件模式的历史..."
git filter-repo --force --index \
  --path "*/test-*.md" \
  --path "*/任务*.md" \
  --path "*/报告*.md" \
  --path "*/优化*.md" \
  --path "*/分析*.md" \
  --invert

echo ""
echo "=========================================="
echo "清理完成"
echo "=========================================="
echo ""

echo "下一步："
echo "  1. 查看清理结果: git log --oneline -10"
echo "  2. 强制推送: git push -f origin main"
echo "  3. 通知所有协作者:"
echo "     - Git历史已重写"
echo "     - 需要重新克隆仓库"
echo "     - git clone --depth 1 <url>"
echo ""
echo "=========================================="
