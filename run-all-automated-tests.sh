#!/bin/bash

# ========================================
# 清迈活动 - 完整自动化测试套件
# ========================================

echo "=========================================="
echo "  清迈活动 - 自动化测试套件"
echo "  运行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

PROJECT_DIR="/Users/yuzhoudeshengyin/Documents/my_project/Chiengmai"
cd "$PROJECT_DIR" || exit 1

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试列表
declare -a TESTS=(
    "test-music-tab.cjs:音乐Tab功能"
    "test-time-sorting.cjs:时间排序功能"
    "test-api-endpoints.cjs:API端点"
    "test-category-filter.cjs:分类筛选"
    "test-core-functions.cjs:核心功能"
)

# 运行单个测试
run_test() {
    local test_file=$1
    local test_name=$2

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 运行测试: $test_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    ((TOTAL_TESTS++))

    if [ ! -f "$test_file" ]; then
        echo -e "${YELLOW}⚠️  测试文件不存在: $test_file${NC}"
        echo -e "${YELLOW}   跳过此测试${NC}\n"
        ((SKIPPED_TESTS++))
        return 1
    fi

    if node "$test_file" > /tmp/test-output.txt 2>&1; then
        echo -e "${GREEN}✅ $test_name 测试通过${NC}"
        ((PASSED_TESTS++))

        # 显示测试详情
        if grep -q "测试完成:" /tmp/test-output.txt; then
            grep "测试完成:" /tmp/test-output.txt | tail -1
        fi
    else
        echo -e "${RED}❌ $test_name 测试失败${NC}"
        ((FAILED_TESTS++))

        # 显示错误详情
        echo -e "${RED}错误输出:${NC}"
        tail -10 /tmp/test-output.txt
    fi

    echo ""
}

# 运行所有测试
echo "开始运行所有测试..."
echo ""

for test_info in "${TESTS[@]}"; do
    IFS=':' read -ra PARTS <<< "$test_info"
    run_test "${PARTS[0]}" "${PARTS[1]}"
done

# 输出总结
echo "=========================================="
echo "  测试总结"
echo "=========================================="
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"
echo -e "${YELLOW}跳过: $SKIPPED_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ] && [ $SKIPPED_TESTS -lt $TOTAL_TESTS ]; then
    SUCCESS_RATE=$(( PASSED_TESTS * 100 / (TOTAL_TESTS - SKIPPED_TESTS) ))
    echo "成功率: ${SUCCESS_RATE}%"
else
    echo "成功率: N/A"
fi
echo ""

# 返回状态
if [ $FAILED_TESTS -eq 0 ] && [ $PASSED_TESTS -gt 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
elif [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}⚠️  有 $FAILED_TESTS 个测试失败${NC}"
    exit 1
else
    echo -e "${YELLOW}⚠️  没有成功运行的测试${NC}"
    exit 1
fi
