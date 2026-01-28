#!/bin/bash

##################################################################################
# Markdown 文件格式检查脚本
# 功能：检查 MD 文件的格式规范，包括编码、换行符、二进制内容等
# 用法：./scripts/check-markdown.sh [文件或目录]
##################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认检查当前目录下的所有MD文件
TARGET_DIR="${1:-.}"
ERRORS_FOUND=0
WARNINGS_FOUND=0

echo "=========================================="
echo "Markdown 格式检查"
echo "=========================================="
echo ""
echo "检查目标: $TARGET_DIR"
echo ""

# ============================================================
# 检查函数
# ============================================================

check_file() {
    local file="$1"
    local filename=$(basename "$file")
    local has_errors=0

    # 跳过不应检查的目录
    if [[ "$file" =~ node_modules|\.nvm|\.claude|internal-archive|\.git ]]; then
        return 0
    fi

    echo -e "${BLUE}检查: $file${NC}"

    # 检查1: 文件编码（应该是UTF-8）
    if ! file -b "$file" | grep -q "UTF-8"; then
        echo -e "  ${RED}❌ 编码错误: 不是UTF-8编码${NC}"
        file -b "$file" | sed 's/^/    /'
        ((ERRORS_FOUND++))
        ((has_errors++))
    else
        echo -e "  ${GREEN}✅ 编码正确: UTF-8${NC}"
    fi

    # 检查2: 换行符（应该是LF，不是CRLF）
    if file -b "$file" | grep -q "CRLF"; then
        echo -e "  ${YELLOW}⚠️  换行符警告: 使用CRLF（Windows风格），建议转换为LF${NC}"
        ((WARNINGS_FOUND++))
    else
        echo -e "  ${GREEN}✅ 换行符正确: LF${NC}"
    fi

    # 检查3: 是否包含嵌入式Base64图片
    if grep -q "data:image/[^;]*;base64,[A-Za-z0-9+/]\{100,\}" "$file"; then
        echo -e "  ${RED}❌ 包含嵌入式Base64图片（不符合规范）${NC}"
        grep -n "data:image/" "$file" | head -3 | sed 's/^/    /'
        echo -e "    ${YELLOW}建议: 使用外部图床或相对路径${NC}"
        ((ERRORS_FOUND++))
        ((has_errors++))
    else
        echo -e "  ${GREEN}✅ 无嵌入式二进制内容${NC}"
    fi

    # 检查4: 标题层级（不应该跳级）
    local prev_level=0
    local line_num=0
    while IFS= read -r line; do
        ((line_num++))
        if [[ "$line" =~ ^(#{1,6})\s+(.+)$ ]]; then
            local level=${#BASH_REMATCH[1]}
            local title="${BASH_REMATCH[2]}"

            # 检查标题格式：#后要有空格
            if [[ ! "$line" =~ ^#\ +.+$ ]]; then
                echo -e "  ${YELLOW}⚠️  第${line_num}行: 标题格式错误（#后缺少空格）${NC}"
                ((WARNINGS_FOUND++))
            fi

            # 检查标题跳级
            if [ $prev_level -gt 0 ] && [ $level -gt $prev_level + 1 ]; then
                echo -e "  ${YELLOW}⚠️  第${line_num}行: 标题跳级（从H${prev_level}跳到H${level}）${NC}"
                echo "    $line"
                ((WARNINGS_FOUND++))
            fi

            prev_level=$level
        fi
    done < "$file"

    # 检查5: 是否有过长的行（超过200字符）
    local long_lines=$(awk 'length > 200 {print NR": "length" 字符"}' "$file")
    if [ -n "$long_lines" ]; then
        echo -e "  ${YELLOW}⚠️  发现过长行（超过200字符）:${NC}"
        echo "$long_lines" | head -3 | sed 's/^/    /'
        ((WARNINGS_FOUND++))
    else
        echo -e "  ${GREEN}✅ 行长度合理${NC}"
    fi

    # 检查6: 文件大小（不应该超过1MB）
    local filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ "$filesize" -gt 1048576 ]; then
        echo -e "  ${YELLOW}⚠️  文件过大: $((filesize / 1024))KB（建议<1MB）${NC}"
        ((WARNINGS_FOUND++))
    fi

    # 检查7: 是否在.gitignore中应该被忽略
    if [[ "$filename" =~ \.tmp\.md$|\.draft\.md$|测试|草稿|备份|\.old$|\.bak$ ]]; then
        echo -e "  ${YELLOW}⚠️  文件名表明这是临时文件，应该被.gitignore忽略${NC}"
        ((WARNINGS_FOUND++))
    fi

    echo ""
}

# ============================================================
# 主流程
# ============================================================

# 检查目标
if [ -f "$TARGET_DIR" ]; then
    # 单个文件
    check_file "$TARGET_DIR"
elif [ -d "$TARGET_DIR" ]; then
    # 目录：递归检查所有MD文件
    while IFS= read -r -d '' file; do
        check_file "$file"
    done < <(find "$TARGET_DIR" -name "*.md" -type f -print0 | grep -z -v node_modules | grep -z -v "\.nvm" | grep -z -v "\.claude" | grep -z -v internal-archive)
else
    echo -e "${RED}错误: 目标不存在${NC}"
    exit 1
fi

# ============================================================
# 总结
# ============================================================

echo "=========================================="
echo "检查总结"
echo "=========================================="
echo ""

if [ $ERRORS_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！${NC}"
    echo ""
    echo "Markdown文件格式良好，符合规范。"
    exit 0
elif [ $ERRORS_FOUND -eq 0 ] && [ $WARNINGS_FOUND -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $WARNINGS_FOUND 个警告${NC}"
    echo ""
    echo "建议修复警告项以提升文档质量。"
    exit 0
else
    echo -e "${RED}❌ 发现 $ERRORS_FOUND 个错误, $WARNINGS_FOUND 个警告${NC}"
    echo ""
    echo "请修复错误后再提交。"
    exit 1
fi
