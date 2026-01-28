#!/bin/bash

# 强制刷新和重启脚本

echo "=== 🔄 重启服务器并清除缓存 ==="
echo ""

# 1. 停止当前服务器
echo "1️⃣ 停止当前服务器..."
pkill -f "node server.cjs"
sleep 2

# 2. 重新启动服务器
echo "2️⃣ 重新启动服务器..."
cd /Users/yuzhoudeshengyin/Documents/my_project/Chiengmai
nohup node server.cjs > server.log 2>&1 &
sleep 2

# 3. 验证服务器启动
echo "3️⃣ 验证服务器状态..."
if ps aux | grep -v grep | grep "node server.cjs" > /dev/null; then
    echo "✅ 服务器已启动"
else
    echo "❌ 服务器启动失败"
    exit 1
fi

# 4. 测试API
echo "4️⃣ 测试API端点..."
sleep 2
ACTIVITY_COUNT=$(curl -s http://localhost:3000/api/activities | jq '.data | length')
echo "   总活动数: $ACTIVITY_COUNT"

if [ "$ACTIVITY_COUNT" = "45" ]; then
    echo "✅ API正常"
else
    echo "❌ API异常"
fi

# 5. 检查0001活动
echo "5️⃣ 检查0001活动状态..."
STATUS=$(curl -s http://localhost:3000/api/activities | jq -r '.data[] | select(.activityNumber == "0001") | .status')
echo "   0001活动状态: $STATUS"

if [ "$STATUS" = "suspended" ]; then
    echo "✅ 数据正确"
else
    echo "❌ 数据异常"
fi

echo ""
echo "=== ✅ 完成！现在请执行以下操作 ==="
echo ""
echo "📱 浏览器操作："
echo "   Mac用户: 按 Cmd + Shift + R (强制刷新)"
echo "   Windows用户: 按 Ctrl + Shift + R (强制刷新)"
echo ""
echo "🌐 访问地址："
echo "   http://localhost:3000/index.html"
echo ""
echo "✅ 验证要点："
echo "   1. 0001瑜伽活动不应该显示"
echo "   2. 活动总数应该显示44个（45-1个暂停）"
echo "   3. 浏览器控制台应该显示: '⏸️ 暂停活动过滤: 45 → 44 (排除 1 个)'"
echo ""
