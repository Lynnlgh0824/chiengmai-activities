#!/bin/bash

##################################################################################
# Markdown 文件格式化脚本
# 功能：自动修复一些常见的MD格式问题
# 用法：./scripts/format-markdown.sh [文件或目录]
##################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TARGET_DIR="${1:-.}"
DRY_RUN="${2:-false}"

# 如果是 --dry-run 模式
if [ "$TARGET_DIR" = "--dry-run" ]; then
    DRY_RUN=true
    TARGET_DIR="${2:-.}"
elif [ "$2" = "--dry-run" ]; then
    DRY_RUN=true
fi

echo "=========================================="
echo "Markdown 格式化"
echo "=========================================="
echo ""
echo "检查目标: $TARGET_DIR"
if [ "$DRY_RUN" = "true" ]; then
    echo -e "${YELLOW}模式: 预演模式（不实际修改文件）${NC}"
fi
echo ""

# ============================================================
# 格式化函数
# ============================================================

format_file() {
    local file="$1"
    local modified=false

    # 跳过不应检查的目录
    if [[ "$file" =~ node_modules|\.nvm|\.claude|internal-archive|\.git ]]; then
        return 0
    fi

    echo -e "${BLUE}处理: $file${NC}"

    # 创建临时文件
    local tmp_file=$(mktemp)
    cp "$file" "$tmp_file"

    # 修复1: 转换换行符为LF
    if file -b "$file" | grep -q "CRLF"; then
        echo -e "  ${YELLOW}⚠️  转换换行符: CRLF → LF${NC}"
        if [ "$DRY_RUN" != "true" ]; then
            tr -d '\r' < "$file" > "$tmp_file"
            modified=true
        fi
    fi

    # 修复2: 确保标题后有空格
    # 例子：##标题 -> ## 标题
    if grep -q "^##[a-zA-Z]" "$tmp_file"; then
        echo -e "  ${YELLOW}⚠️  修复标题格式：添加空格${NC}"
        if [ "$DRY_RUN" != "true" ]; then
            sed -i '' 's/^\(\#\#\#\?\#\?\#\?\)\([^#[:space:]]\)/\1 \2/g' "$tmp_file"
            modified=true
        fi
    fi

    # 修复3: 删除标题末尾的标点
    # 例子：## 简介。 -> ## 简介
    if grep -q "^#\+.*[。:：、]$" "$tmp_file"; then
        echo -e "  ${YELLOW}⚠️  删除标题末尾标点${NC}"
        if [ "$DRY_RUN" != "true" ]; then
            sed -i '' 's/^\(\#\+.*\)[。:：、]$/\1/g' "$tmp_file"
            modified=true
        fi
    fi

    # 修复4: 确保标题前后有空行
    if [ "$DRY_RUN" != "true" ]; then
        # 在标题前添加空行（如果前面不是空行）
        awk '
        /^#{1,6} / {
            if (NR > 1 && prev_line !~ /^$/) {
                print ""
            }
            print $0
            prev_line=$0
            next
        }
        {
            print $0
            prev_line=$0
        }
        ' "$tmp_file" > "${tmp_file}.2" && mv "${tmp_file}.2" "$tmp_file"
    fi

    # 修复5: 统一中英文标点（可选，注释掉以避免过度修改）
    # if [ "$DRY_RUN" != "true" ]; then
    #     # 将中文括号改为英文括号（仅在某些情况下）
    #     sed -i '' 's/（/(/g; s/）/)/g' "$tmp_file"
    # fi

    # 应用修改
    if [ "$modified" = true ] || [ "$DRY_RUN" = "true" ]; then
        if [ "$DRY_RUN" != "true" ]; then
            mv "$tmp_file" "$file"
            echo -e "  ${GREEN}✅ 已修改${NC}"
        else
            echo -e "  ${BLUE}ℹ️  预演：将会修改${NC}"
            rm "$tmp_file"
        fi
    else
        echo -e "  ${GREEN}✅ 无需修改${NC}"
        rm "$tmp_file"
    fi

    echo ""
}

# ============================================================
# 主流程
# ============================================================

# 检查目标
if [ -f "$TARGET_DIR" ]; then
    # 单个文件
    format_file "$TARGET_DIR"
elif [ -d "$TARGET_DIR" ]; then
    # 目录：递归格式化所有MD文件
    while IFS= read -r -d '' file; do
        format_file "$file"
    done < <(find "$TARGET_DIR" -name "*.md" -type f -print0 | grep -z -v node_modules | grep -z -v "\.nvm" | grep -z -v "\.claude" | grep -z -v internal-archive)
else
    echo -e "${RED}错误: 目标不存在${NC}"
    exit 1
fi

# ============================================================
# 总结
# ============================================================

echo "=========================================="
echo -e "${GREEN}格式化完成${NC}"
echo "=========================================="
echo ""

if [ "$DRY_RUN" = "true" ]; then
    echo "这是预演模式，没有实际修改文件。"
    echo "如果不带 --dry-run 参数运行，将应用上述修改。"
else
    echo "已格式化指定目录下的所有Markdown文件。"
    echo ""
    echo "建议："
    echo "  1. 运行 git diff 查看修改"
    echo "  2. 如果满意，提交修改：git add . && git commit -m 'style: 格式化MD文件'"
    echo "  3. 如果不满意，撤销：git checkout -- ."
fi
