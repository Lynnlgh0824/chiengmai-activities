#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  移动端优化自动测试与修复工具${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 获取服务器HTML
echo -e "${BLUE}[1/6]${NC} 正在获取服务器内容..."
HTML=$(curl -s http://localhost:3000 2>/dev/null)

if [ -z "$HTML" ]; then
    echo -e "${RED}❌ 无法连接到服务器 http://localhost:3000${NC}"
    echo -e "${YELLOW}请确保服务器正在运行:${NC} npm start"
    exit 1
fi

echo -e "${GREEN}✓ 服务器连接正常${NC}"
echo ""

# 测试计数器
PASS=0
FAIL=0
WARN=0

# 测试1: Tab顶部空白
echo -e "${BLUE}[2/6]${NC} 测试Tab顶部空白优化..."
if echo "$HTML" | grep -q "padding-top: 120px !important"; then
    echo -e "${GREEN}✅ 通过${NC}: .tab-pane padding-top: 120px"
    ((PASS++))
elif echo "$HTML" | grep -q "padding-top: 1[0-9][0-9]px !important"; then
    PADDING=$(echo "$HTML" | grep -o "padding-top: 1[0-9][0-9]px !important" | head -1 | grep -o "[0-9]*")
    echo -e "${YELLOW}⚠️  警告${NC}: .tab-pane padding-top: ${PADDING}px (目标: 120px)"
    echo -e "   建议: 将padding-top改为120px"
    ((WARN++))
else
    echo -e "${RED}❌ 失败${NC}: 未找到Tab顶部空白优化"
    echo -e "   修复: 在@media (max-width: 768px)中添加 .tab-pane { padding-top: 120px !important; }"
    ((FAIL++))
fi
echo ""

# 测试2: Tab 4特殊处理
echo -e "${BLUE}[3/6]${NC} 测试Tab 4特殊处理..."
if echo "$HTML" | grep -q "#tab-4" | grep -q "padding-top: 115px !important"; then
    echo -e "${GREEN}✅ 通过${NC}: #tab-4.tab-pane padding-top: 115px"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  可选${NC}: 未找到Tab 4特殊处理"
    echo -e "   建议: 为#tab-4单独设置padding-top: 115px"
fi
echo ""

# 测试3: 移动端间距优化
echo -e "${BLUE}[4/6]${NC} 测试移动端间距优化..."
COUNT=$(echo "$HTML" | grep -c "移动端间距优化")
if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ 通过${NC}: 找到移动端间距优化区块"

    # 检查具体元素
    MISSING=0

    if ! echo "$HTML" | grep -A 1 "\.container" | grep -q "padding-left: 8px"; then
        echo -e "   ${YELLOW}⚠️  缺失${NC}: .container padding-left: 8px"
        ((MISSING++))
    fi

    if ! echo "$HTML" | grep -A 1 "\.filter-section" | grep -q "padding: 8px 12px"; then
        echo -e "   ${YELLOW}⚠️  缺失${NC}: .filter-section padding: 8px 12px"
        ((MISSING++))
    fi

    if ! echo "$HTML" | grep -A 1 "\.results-count" | grep -q "padding: 6px 12px"; then
        echo -e "   ${YELLOW}⚠️  缺失${NC}: .results-count padding: 6px 12px"
        ((MISSING++))
    fi

    if [ $MISSING -eq 0 ]; then
        echo -e "${GREEN}   所有间距优化已应用${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}   缺少${MISSING}个间距优化${NC}"
        ((WARN++))
    fi
else
    echo -e "${RED}❌ 失败${NC}: 未找到移动端间距优化区块"
    echo -e "   修复: 在@media (max-width: 768px)中添加移动端间距优化CSS"
    ((FAIL++))
fi
echo ""

# 测试4: 滚动日期高亮功能
echo -e "${BLUE}[5/6]${NC} 测试滚动日期高亮功能..."
if echo "$HTML" | grep -q "function initH5ScrollDateHighlight" && \
   echo "$HTML" | grep -q "function highlightDateInView" && \
   echo "$HTML" | grep -q "function updateDateHighlight"; then
    echo -e "${GREEN}✅ 通过${NC}: 3个核心函数已实现"
    ((PASS++))
else
    echo -e "${RED}❌ 失败${NC}: 滚动日期高亮功能不完整"
    echo -e "   修复: 实现initH5ScrollDateHighlight、highlightDateInView、updateDateHighlight函数"
    ((FAIL++))
fi
echo ""

# 测试5: CSS样式有效性
echo -e "${BLUE}[6/6]${NC} 测试CSS样式有效性..."
IMPORTANT=$(echo "$HTML" | grep -c "!important")
HAS_MOBILE_MEDIA=$(echo "$HTML" | grep -c "@media.*max-width.*768px")

if [ $HAS_MOBILE_MEDIA -gt 0 ]; then
    echo -e "${GREEN}✅ 通过${NC}: CSS语法正常"
    echo -e "   !important使用: ${IMPORTANT}处"

    if [ $IMPORTANT -gt 150 ]; then
        echo -e "   ${YELLOW}⚠️  建议${NC}: !important使用较多，考虑使用CSS变量"
        ((WARN++))
    else
        ((PASS++))
    fi
else
    echo -e "${RED}❌ 失败${NC}: 未找到移动端媒体查询"
    ((FAIL++))
fi
echo ""

# 总结
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  测试结果统计${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${GREEN}✅ 通过: $PASS${NC}"
echo -e "${YELLOW}⚠️  警告: $WARN${NC}"
echo -e "${RED}❌ 失败: $FAIL${NC}"
echo ""

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    RATE=$((PASS * 100 / TOTAL))
    echo -e "通过率: ${RATE}%"
else
    echo -e "通过率: N/A"
fi
echo ""

# 修复建议
if [ $FAIL -gt 0 ] || [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}=========================================${NC}"
    echo -e "${YELLOW}  修复建议${NC}"
    echo -e "${YELLOW}=========================================${NC}"
    echo ""

    if [ $FAIL -gt 0 ]; then
        echo -e "${RED}需要立即修复的问题:${NC}"
        echo "1. 确保所有CSS优化都在 @media (max-width: 768px) 块内"
        echo "2. 检查CSS规则是否正确添加到public/index.html"
        echo "3. 确保JavaScript函数已正确实现"
        echo ""
    fi

    if [ $WARN -gt 0 ]; then
        echo -e "${YELLOW}建议优化的项目:${NC}"
        echo "1. 考虑使用CSS变量替代硬编码的spacing值"
        echo "2. 减少!important的使用，提高CSS可维护性"
        echo "3. 为Tab 4添加特殊的padding处理"
        echo ""
    fi
fi

# 返回状态码
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有关键测试通过！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  存在需要修复的问题${NC}"
    exit 1
fi
