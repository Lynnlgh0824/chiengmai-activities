#!/bin/bash

# Excel自动同步启动脚本
# 用法: bash start-excel-sync.sh

echo "🔄 启动Excel自动同步系统"
echo "================================"

# 检查Excel文件是否存在
if [ ! -f "清迈活动数据.xlsx" ]; then
    echo "❌ 错误: 清迈活动数据.xlsx 文件不存在"
    echo "请确保Excel文件在项目根目录"
    exit 1
fi

echo "✅ Excel文件已找到"
echo ""
echo "📋 工作原理:"
echo "   1. 监听Excel文件变化"
echo "   2. 自动导入到 data/items.json"
echo "   3. 备份旧数据到 backups/ 目录"
echo "   4. 记录日志到 logs/ 目录"
echo ""
echo "💡 使用提示:"
echo "   - 修改Excel文件后，自动触发导入"
echo "   - 按 Ctrl+C 停止监听"
echo ""
read -p "按Enter键开始监听..."

# 启动监听
node scripts/watch-excel.mjs
