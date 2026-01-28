#!/bin/bash

################################################################################
# 每日自动提交脚本
# 功能：每天0点自动检查代码变更、运行测试、提交更新
# 使用：添加到crontab或手动运行
################################################################################

set -e  # 遇到错误立即退出

# ============================================================
# 配置
# ============================================================

PROJECT_DIR="/Users/yuzhoudeshengyin/Documents/my_project/Chiengmai"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/daily-auto-commit-$(date '+%Y%m%d').log"
COMMIT_MSG_PREFIX="auto: 每日自动提交"
REPORT_FILE="$LOG_DIR/daily-report-$(date '+%Y%m%d').md"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================
# 日志函数
# ============================================================

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# ============================================================
# 初始化
# ============================================================

init() {
    log "=========================================="
    log "每日自动提交脚本启动"
    log "=========================================="

    # 创建日志目录
    mkdir -p "$LOG_DIR"

    # 切换到项目目录
    cd "$PROJECT_DIR" || {
        error "无法切换到项目目录: $PROJECT_DIR"
        exit 1
    }

    log "工作目录: $PROJECT_DIR"
    log "日志文件: $LOG_FILE"
}

# ============================================================
# 检查Git状态
# ============================================================

check_git_status() {
    log "----------------------------------------"
    log "检查Git状态"
    log "----------------------------------------"

    # 检查是否有未提交的更改
    if git diff --quiet && git diff --cached --quiet; then
        log "✅ 没有未提交的更改"
        return 1
    else
        log "⚠️  发现未提交的更改"

        # 显示更改的文件
        echo ""
        log "更改的文件:"
        git status --short | tee -a "$LOG_FILE"

        return 0
    fi
}

# ============================================================
# 运行测试
# ============================================================

run_tests() {
    log "----------------------------------------"
    log "运行测试"
    log "----------------------------------------"

    local tests_passed=0
    local tests_failed=0

    # 测试1: 音乐Tab测试
    log "运行音乐Tab测试..."
    if [ -f "test-music-tab.cjs" ]; then
        if node test-music-tab.cjs >> "$LOG_FILE" 2>&1; then
            log "✅ 音乐Tab测试通过"
            ((tests_passed++))
        else
            error "❌ 音乐Tab测试失败"
            ((tests_failed++))
        fi
    else
        warn "test-music-tab.cjs 不存在，跳过"
    fi

    # 测试2: 检查时间排序函数
    log "检查时间排序函数..."
    if grep -q "function compareTimes" public/index.html; then
        log "✅ compareTimes函数存在"
        ((tests_passed++))
    else
        error "❌ compareTimes函数不存在"
        ((tests_failed++))
    fi

    if grep -q "function extractEndTime" public/index.html; then
        log "✅ extractEndTime函数存在"
        ((tests_passed++))
    else
        error "❌ extractEndTime函数不存在"
        ((tests_failed++))
    fi

    # 测试3: 检查音乐Tab
    log "检查音乐Tab..."
    local music_tab_count=$(grep -c "音乐" public/index.html || true)
    if [ "$music_tab_count" -gt 10 ]; then
        log "✅ 音乐Tab存在 ($music_tab_count 处引用)"
        ((tests_passed++))
    else
        error "❌ 音乐Tab可能缺失 ($music_tab_count 处引用)"
        ((tests_failed++))
    fi

    log "测试结果: $tests_passed 通过, $tests_failed 失败"

    if [ $tests_failed -gt 0 ]; then
        error "有测试失败，跳过自动提交"
        return 1
    fi

    return 0
}

# ============================================================
# 生成提交信息
# ============================================================

generate_commit_message() {
    local msg="$COMMIT_MSG_PREFIX - $(date '+%Y-%m-%d %H:%M')"

    # 添加更改摘要
    msg+="

自动提交的更改:
"

    # 获取更改的文件列表
    local changed_files=$(git status --short | awk '{print $2}')

    for file in $changed_files; do
        case "$file" in
            public/index.html)
                msg+="✓ 主应用文件更新
"
                ;;
            *.md)
                msg+="✓ 文档更新: $(basename $file)
"
                ;;
            test-*.html|test-*.cjs)
                msg+="✓ 测试文件更新: $(basename $file)
"
                ;;
            *)
                msg+="✓ $file
"
                ;;
        esac
    done

    msg+="

测试状态: 所有测试通过
触发方式: 定时任务（每天0点）
"

    echo "$msg"
}

# ============================================================
# 提交更改
# ============================================================

commit_changes() {
    log "----------------------------------------"
    log "提交更改"
    log "----------------------------------------"

    # 生成提交信息
    local commit_msg=$(generate_commit_message)

    log "提交信息:"
    echo "$commit_msg" | tee -a "$LOG_FILE"

    # 添加所有更改
    log "添加文件到暂存区..."
    git add -A

    # 提交
    log "创建提交..."
    if git commit -m "$commit_msg"; then
        log "✅ 提交成功"

        # 推送到远程
        log "推送到远程仓库..."
        if git push origin main; then
            log "✅ 推送成功"
            return 0
        else
            error "❌ 推送失败"
            return 1
        fi
    else
        error "❌ 提交失败"
        return 1
    fi
}

# ============================================================
# 生成每日报告
# ============================================================

generate_daily_report() {
    log "----------------------------------------"
    log "生成每日报告"
    log "----------------------------------------"

    cat > "$REPORT_FILE" << EOF
# 每日自动提交报告

**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')
**触发方式**: 定时任务（每天0点）

---

## 📊 代码状态

### Git状态
\`\`\`
$(git status --short)
\`\`\`

### 最新提交
- **Commit**: $(git log -1 --pretty=format:'%h')
- **消息**: $(git log -1 --pretty=format:'%s')
- **作者**: $(git log -1 --pretty=format:'%an')
- **时间**: $(git log -1 --pretty=format:'%ad')

---

## ✅ 测试结果

### 功能检查
- ✅ compareTimes函数: $(grep -q "function compareTimes" public/index.html && echo "存在" || echo "缺失")
- ✅ extractEndTime函数: $(grep -q "function extractEndTime" public/index.html && echo "存在" || echo "缺失")
- ✅ 音乐Tab: $(grep -c "音乐" public/index.html || echo "0") 处引用

---

## 📝 更新摘要

### 修改的文件
$(git status --short | awk '{print "- " $2}' || echo "无修改")

---

## 🔗 相关链接

- **GitHub**: [查看提交历史](https://github.com/Lynnlgh0824/Chiengmai/commits/main)
- **测试页面**: http://localhost:3000/test-time-sorting.html
- **主应用**: http://localhost:3000

---

**报告生成**: 自动化脚本
**日志文件**: \`$LOG_FILE\`
EOF

    log "报告已生成: $REPORT_FILE"
}

# ============================================================
# 发送通知（可选）
# ============================================================

send_notification() {
    log "----------------------------------------"
    log "发送通知"
    log "----------------------------------------"

    # 这里可以添加发送邮件、Slack、钉钉等通知
    # 目前只记录到日志
    log "通知: 每日自动提交完成"

    # 如果有桌面通知工具（如terminal-notifier）
    if command -v terminal-notifier &> /dev/null; then
        terminal-notifier -title "每日自动提交" -message "代码已自动提交并推送" -sound default
    fi
}

# ============================================================
# 主流程
# ============================================================

main() {
    # 初始化
    init

    # 检查Git状态
    if ! check_git_status; then
        log "没有需要提交的更改，脚本结束"
        generate_daily_report
        exit 0
    fi

    # 运行测试
    if ! run_tests; then
        error "测试失败，跳过自动提交"
        exit 1
    fi

    # 提交更改
    if commit_changes; then
        # 生成报告
        generate_daily_report

        # 发送通知
        send_notification

        log "=========================================="
        log "✅ 每日自动提交完成"
        log "=========================================="
        exit 0
    else
        error "提交失败"
        exit 1
    fi
}

# ============================================================
# 脚本入口
# ============================================================

# 捕获错误
trap 'error "脚本执行失败 (行号: $LINENO)"' ERR

# 运行主流程
main

# 脚本结束
log "脚本执行完成"
exit 0
