#!/bin/bash
# 快捷测试脚本 - 一键运行所有测试

echo "🔍 快速测试..."
echo ""

# 运行命令行测试
./test-mobile-verify.sh
RESULT=$?

echo ""
echo "💡 提示:"
echo "  - 浏览器详细测试: open http://localhost:3000/test-auto-verify.html"
echo "  - 手动测试: open http://localhost:3000/test-mobile-verification.html"

exit $RESULT
