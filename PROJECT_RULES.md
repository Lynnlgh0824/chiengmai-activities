# PROJECT_RULES.md - 项目规则和约定

> **项目**: Chiengmai Activities Platform (清迈活动策划管理系统)
> **版本**: v2.2.0
> **最后更新**: 2026-02-25
> **状态**: ✅ 活跃维护中

---

## 📖 概述

本文档定义了 **Chiengmai Activities Platform** 项目的开发规范、代码标准和协作约定，确保团队成员能够高效、一致地进行开发工作。

---

## 🔧 代码规范

### 1. JavaScript 规范

#### 文件编码
- **字符编码**: UTF-8
- **缩进方式**: 4 空格
- **语句结尾**: 必须使用分号
- **字符串引号**: 优先使用单引号

```javascript
// ✅ 正确示例
const STORAGE_KEY = 'chiengmai_activities';

function saveActivity(activity) {
    const data = loadActivities();
    data.push(activity);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ❌ 错误示例
const storageKey = "chiengmai_activities"
function saveActivity(activity) {
    const data = loadActivities()
    data.push(activity)
    localStorage.setItem(storageKey, JSON.stringify(data))
}
```

#### 变量命名
```javascript
// 常量：UPPER_SNAKE_CASE
const DEFAULT_STATUS = 'draft';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// 普通变量：camelCase
let currentActivity = null;
const activitiesList = [];

// 类名：PascalCase
class ActivityManager {
    constructor() {
        this.activities = [];
    }
}

// 私有属性：前缀下划线
class DataStore {
    constructor() {
        this._cache = new Map();
    }
}
```

#### 函数规范
```javascript
/**
 * 保存活动数据
 * @param {Object} activity - 活动对象
 * @param {string} activity.title - 活动标题
 * @param {string} activity.status - 活动状态 (draft/pending/ongoing/expired)
 * @param {string} activity.category - 活动分类
 * @returns {Promise<boolean>} 保存成功返回 true
 */
async function saveActivity(activity) {
    try {
        const data = await loadData();
        data.activities.push(activity);
        await persistData(data);
        return true;
    } catch (error) {
        console.error('保存失败:', error);
        return false;
    }
}
```

---

### 2. HTML 规范

#### 结构规范
```html
<!-- ✅ 正确示例 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>清迈活动策划管理系统</title>
</head>
<body>
    <div class="container">
        <!-- 内容 -->
    </div>
</body>
</html>
```

#### 命名规范
```html
<!-- ✅ 正确示例 -->
<div id="activity-form" class="form-container">
    <button class="btn btn-primary" data-action="save">
        保存
    </button>
</div>

<!-- ❌ 错误示例 -->
<div id="activityForm" class="form_container">  <!-- 应使用连字符 -->
    <button class="btnPrimary">  <!-- 应使用多个类名 -->
        保存
    </button>
</div>
```

---

### 3. CSS 规范

#### 类名规范
```css
/* ✅ 正确示例 */
.activity-card {
    padding: 20px;
    border-radius: 8px;
}

.activity-card--draft {
    background: #f5f5f5;
}

.activity-card__title {
    font-size: 18px;
    font-weight: bold;
}

/* ❌ 错误示例 */
.activityCard {  /* 应使用连字符 */
    padding: 20px;
}

.ActivityTitle {  /* 不应使用大写开头 */
    font-size: 18px;
}
```

#### 选择器优先级
```css
/* ✅ 推荐：使用类名 */
.container .activity-card {
    /* 样式 */
}

/* ❌ 避免：过深的嵌套 */
.container .activity-list .activity-item .title .text {
    /* 样式 */
}
```

---

## 🔄 Git 工作流

### 1. 分支策略

```
main (主分支)
 ├── protected
 ├── 只接受 Pull Request
 ├── 自动部署到生产环境

feature/* (功能分支)
 ├── feature/image-upload
 ├── feature/auto-status-update
 └── 从 main 分出，完成后合并回 main

fix/* (修复分支)
 ├── fix/data-validation-bug
 ├── fix/mobile-layout-issue
 └── 用于紧急修复

docs/* (文档分支)
 ├── docs/update-api-guide
 └── 用于文档更新
```

### 2. Commit 规范

#### Commit Message 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型
| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加图片上传功能` |
| `fix` | Bug 修复 | `fix: 修复状态字段验证错误` |
| `docs` | 文档更新 | `docs: 更新 API 文档` |
| `style` | 代码格式 | `style: 统一缩进为 4 空格` |
| `refactor` | 重构 | `refactor: 重构数据验证模块` |
| `perf` | 性能优化 | `perf: 优化大数据加载速度` |
| `test` | 测试相关 | `test: 添加单元测试` |
| `chore` | 构建/工具 | `chore: 更新依赖版本` |

#### Commit 示例
```bash
# ✅ 正确示例
git commit -m "feat(upload): 添加图片拖拽上传功能

- 支持拖拽上传
- 添加图片预览
- 文件大小限制 5MB
- 支持删除图片

Closes #123"

# ❌ 错误示例
git commit -m "更新代码"     # 太模糊
git commit -m "fix bug"      # 缺少具体内容
```

### 3. Pull Request 规范

#### PR 标题格式
```
[Type] 简短描述

例如：
[Feat] 添加图片上传功能
[Fix] 修复移动端日期筛选问题
[Docs] 更新项目文档
```

#### PR 描述模板
```markdown
## 📝 变更说明
简要描述本次变更的内容和目的

## 🔗 相关 Issue
Closes #123

## ✅ 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 代码重构
- [ ] 文档更新
- [ ] 性能优化

## 🧪 测试情况
- [ ] 本地测试通过
- [ ] 移动端测试通过
- [ ] 图片上传测试通过

## 📸 截图（如适用）
<!-- 添加截图展示变更效果 -->
```

---

## 📁 文件命名规范

### 1. HTML 文件
```
格式: <功能名称>.html

✅ 正确示例:
- admin.html                  (管理后台)
- index.html                  (首页)
- debug_admin.html            (调试工具)

❌ 错误示例:
- Admin.html                  (不应使用大写)
- admin_panel.html            (不应使用下划线)
```

### 2. JavaScript 文件
```
格式: <功能描述>.js 或 <功能描述>.mjs

✅ 正确示例:
- test-framework.mjs          (测试框架)
- auto-fix-all.mjs            (自动修复工具)
- smart-fix-descriptions.mjs  (智能描述修复)

❌ 错误示例:
- TestFramework.mjs           (不应使用 PascalCase)
- test_framework.mjs          (不应使用下划线)
```

### 3. 数据文件
```
格式: <名称>.json

✅ 正确示例:
- items.json                  (活动数据)
- items.json.backup.20250124  (备份文件，带时间戳)

❌ 错误示例:
- itemsData.json              (不应使用驼峰命名)
- activity_data.json          (不应使用下划线)
```

### 4. Markdown 文档
```
✅ 正确示例:
- README.md                   (项目说明)
- TESTING-GUIDE.md            (测试指南)
- 状态字段功能说明.md          (功能说明)

❌ 错误示例:
- readme.md                   (应使用全大写)
- testing_guide.md            (应使用连字符)
```

---

## 🎨 状态字段规范

### 状态值定义

```javascript
const STATUS = {
    DRAFT: 'draft',       // 📝 草稿
    PENDING: 'pending',   // ⏰ 待开始
    ONGOING: 'ongoing',   // 🚀 进行中
    EXPIRED: 'expired'    // 📅 已过期
};
```

### 状态颜色系统

| 状态 | 英文值 | 颜色 | 色值 | Emoji |
|------|--------|------|------|-------|
| 📝 草稿 | draft | 灰色 | #9E9E9E | 📝 |
| ⏰ 待开始 | pending | 橙色 | #FFA726 | ⏰ |
| 🚀 进行中 | ongoing | 绿色 | #66BB6A | 🚀 |
| 📅 已过期 | expired | 红色 | #EF5350 | 📅 |

### 状态转换规则

```javascript
// ✅ 允许的状态转换
const STATUS_TRANSITIONS = {
    'draft': ['pending', 'expired'],
    'pending': ['ongoing', 'expired'],
    'ongoing': ['expired'],
    'expired': [] // 终态，不可转换
};

// ❌ 不允许的直接转换
// draft → ongoing (必须先经过 pending)
// expired → 其他状态 (终态)
```

---

## 🔒 安全规范

### 1. 数据安全
- ❌ **禁止提交**: `.env` 文件、密钥文件、凭证文件
- ✅ **提交模板**: `.env.example` (不包含真实值)
- ✅ **敏感信息**: 使用环境变量存储

### 2. 文件上传安全
```javascript
// ✅ 文件类型验证
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('不支持的文件类型');
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('文件大小超过 5MB');
    }
    return true;
}
```

### 3. 代码审查
- 所有代码变更必须经过 Code Review
- 安全相关变更需要双人确认
- 第三方依赖引入前需要安全审查

---

## 🧪 测试规范

### 1. 测试文件命名
```
格式: <被测试文件名>.test.js 或 <功能>.test.mjs

✅ 正确示例:
- data-validation.test.mjs     (数据验证测试)
- auto-fix.test.mjs            (自动修复测试)
```

### 2. 测试用例规范
```javascript
// ✅ 正确示例
describe('数据验证', () => {
    test('应该验证必填字段', () => {
        const result = validateActivity({});
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('title is required');
    });

    test('应该接受有效的活动数据', () => {
        const activity = {
            title: '测试活动',
            category: '市集',
            status: 'draft'
        };
        const result = validateActivity(activity);
        expect(result.valid).toBe(true);
    });
});
```

---

## 📊 数据质量规范

### 1. 必填字段
```javascript
const REQUIRED_FIELDS = [
    'title',          // 活动标题
    'category',       // 活动分类
    'status',         // 活动状态
    'description'     // 活动描述
];
```

### 2. 数据完整性检查
```javascript
function validateActivity(activity) {
    const errors = [];

    // 检查必填字段
    REQUIRED_FIELDS.forEach(field => {
        if (!activity[field]) {
            errors.push(`${field} is required`);
        }
    });

    // 检查状态值
    if (!Object.values(STATUS).includes(activity.status)) {
        errors.push(`Invalid status: ${activity.status}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
```

### 3. 描述重复检测
```javascript
function detectDuplicateDescriptions(activities) {
    const descriptions = {};
    const duplicates = [];

    activities.forEach((activity, index) => {
        const desc = activity.description?.trim().toLowerCase();
        if (!desc) return;

        if (descriptions[desc]) {
            duplicates.push({
                index,
                duplicateIndex: descriptions[desc],
                description: activity.description
            });
        } else {
            descriptions[desc] = index;
        }
    });

    return duplicates;
}
```

---

## 📝 文档维护

### 文档更新要求
| 文档 | 更新频率 | 负责人 |
|------|----------|--------|
| README.md | 每次发布 | 项目维护者 |
| CHANGELOG.md | 每次 Commit | 开发者 |
| PROJECT_RULES.md | 按需更新 | 团队共识 |
| TESTING-GUIDE.md | 测试变更时 | 测试负责人 |

---

## 🎯 开发工作流

### 1. 功能开发流程
```
1. 创建功能分支
   git checkout -b feature/new-feature

2. 开发并测试
   - 编写代码
   - 本地测试
   - 添加测试用例

3. 提交变更
   git add .
   git commit -m "feat: 添加新功能"

4. 推送到远程
   git push origin feature/new-feature

5. 创建 Pull Request
   - 填写 PR 模板
   - 等待 Code Review

6. 合并到主分支
   - Review 通过后合并
   - 删除功能分支
```

### 2. Bug 修复流程
```
1. 创建修复分支
   git checkout -b fix/bug-name

2. 修复并测试
   - 定位问题
   - 编写修复代码
   - 添加回归测试

3. 验证修复
   - 本地测试
   - 确认问题解决

4. 提交并合并
   git commit -m "fix: 修复问题描述"
   git push origin fix/bug-name
```

---

**文档版本**: v1.0.0
**维护者**: Chiengmai Team
**最后审核**: 2026-02-25
