#!/bin/bash

echo "=== 移动端优化验证 ==="
echo ""

# 获取服务器HTML
HTML=$(curl -s http://localhost:3000)

# 检查1: Tab顶部空白
if echo "$HTML" | grep -q "padding-top: 120px !important"; then
    echo "✓ 1. Tab顶部空白优化: 120px"
else
    echo "✗ 1. Tab顶部空白优化: 未找到"
fi

# 检查2: Tab 4特殊处理
if echo "$HTML" | grep -q "padding-top: 115px !important"; then
    echo "✓ 2. Tab 4特殊处理: 115px"
else
    echo "✗ 2. Tab 4特殊处理: 未找到"
fi

# 检查3: Container padding
if echo "$HTML" | grep -q "padding-left: 8px !important"; then
    echo "✓ 3. Container左右padding: 8px"
else
    echo "✗ 3. Container左右padding: 未找到"
fi

# 检查4: Filter section
if echo "$HTML" | grep -q ".filter-section" | grep -q "padding: 8px 12px !important"; then
    echo "✓ 4. Filter section padding: 8px 12px"
else
    echo "✗ 4. Filter section padding: 未找到"
fi

# 检查5: Results count
if echo "$HTML" | grep -q ".results-count" | grep -q "padding: 6px 12px !important"; then
    echo "✓ 5. Results count padding: 6px 12px"
else
    echo "✗ 5. Results count padding: 未找到"
fi

# 检查6: Day cell
if echo "$HTML" | grep -q ".day-cell" | grep -q "padding: 8px !important"; then
    echo "✓ 6. Day cell padding: 8px"
else
    echo "✗ 6. Day cell padding: 未找到"
fi

# 检查7: 滚动日期高亮函数
if echo "$HTML" | grep -q "function initH5ScrollDateHighlight"; then
    echo "✓ 7. 滚动日期高亮功能: 已实现"
else
    echo "✗ 7. 滚动日期高亮功能: 未找到"
fi

echo ""
echo "=== 验证完成 ==="
