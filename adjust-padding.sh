#!/bin/bash

# H5顶部空白快速调整工具
# 版本: v1.0.7

echo "🎨 H5顶部空白快速调整工具"
echo "================================"
echo ""

# 显示当前值
echo "📏 当前值:"
grep -n "padding-top:.*!important" public/index.html | grep ".tab-pane" | head -1
echo ""

# 提供选项
echo "请选择新的 padding-top 值:"
echo "1) 30px (当前版本)"
echo "2) 20px (更紧凑，推荐)"
echo "3) 10px (最紧凑)"
echo "4) 40px (更宽松)"
echo "5) 自定义值"
echo "6) 仅查看当前值，不修改"
echo ""
read -p "请输入选项 (1-6): " choice

case $choice in
  1)
    value=30
    echo "✅ 选择: 30px (当前版本)"
    ;;
  2)
    value=20
    echo "✅ 选择: 20px (更紧凑)"
    ;;
  3)
    value=10
    echo "✅ 选择: 10px (最紧凑)"
    ;;
  4)
    value=40
    echo "✅ 选择: 40px (更宽松)"
    ;;
  5)
    read -p "请输入自定义值 (px): " value
    if ! [[ "$value" =~ ^[0-9]+$ ]]; then
      echo "❌ 无效的数值"
      exit 1
    fi
    echo "✅ 选择: ${value}px (自定义)"
    ;;
  6)
    echo "ℹ️ 仅查看当前值，退出"
    exit 0
    ;;
  *)
    echo "❌ 无效选项"
    exit 1
    ;;
esac

echo ""
echo "🔄 正在修改..."

# 替换数值（使用 BSD sed 语法 - macOS）
sed -i '' "s/padding-top: [0-9]*px !important;/padding-top: ${value}px !important;/" public/index.html

if [ $? -eq 0 ]; then
  echo "✅ 已修改为 ${value}px"

  echo ""
  echo "🔄 重启服务器..."
  bash refresh-and-restart.sh

  echo ""
  echo "✅ 完成！"
  echo ""
  echo "📱 下一步操作:"
  echo "   1. 强制刷新浏览器:"
  echo "      Mac: 按 Cmd + Shift + R"
  echo "      Windows: 按 Ctrl + Shift + R"
  echo ""
  echo "   2. 访问H5模式验证效果:"
  echo "      http://localhost:3000/public/index.html?mode=h5"
  echo ""
  echo "   3. 检查以下要点:"
  echo "      □ 顶部空白是否合适？"
  echo "      □ 内容是否被筛选栏遮挡？"
  echo "      □ 视觉效果是否舒适？"
  echo ""
  echo "   4. 如需继续调整，重新运行此脚本:"
  echo "      ./adjust-padding.sh"
else
  echo "❌ 修改失败"
  exit 1
fi
