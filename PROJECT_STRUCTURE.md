# PROJECT_STRUCTURE.md - 项目结构详解

> **项目**: Chiang Mai Guide Platform
> **版本**: v2.2.0
> **最后更新**: 2026-02-25
> **项目根目录**: `/Users/yuzhoudeshengyin/Documents/my_project/Chiengmai`

---

## 📁 目录结构

### 完整目录树

```
Chiengmai/
├── 📄 核心应用文件
│   ├── index.html                  # 主页面（活动展示）
│   ├── admin.html                  # 管理后台 ⭐
│   └── debug_admin.html            # 调试工具
│
├── 📊 数据目录
│   └── data/
│       ├── items.json              # 活动数据（主文件）⭐
│       └── items.json.backup.*     # 自动备份文件
│
├── 🔧 自动化脚本
│   └── scripts/
│       ├── test-framework.mjs      # 测试框架 ⭐
│       ├── auto-fix-all.mjs        # 自动修复工具
│       ├── smart-fix-descriptions.mjs  # 智能描述修复
│       └── comprehensive-description-check.mjs  # 描述检查
│
├── 📚 文档目录
│   ├── README.md                   # 项目说明 ⭐
│   ├── CHANGELOG.md                # 变更日志 ⭐
│   ├── PROJECT_RULES.md            # 项目规则 ⭐
│   ├── PROJECT_CONTEXT.md          # 项目上下文 ⭐
│   ├── PROJECT_STRUCTURE.md        # 项目结构 ⭐ (本文件)
│   ├── STRUCTURE.md                # 结构说明
│   ├── 状态字段功能说明.md          # 状态功能文档
│   ├── 问题排查指南.md              # 问题诊断
│   ├── 编辑功能修复报告.md          # 修复详情
│   ├── 弹窗按钮悬浮布局.md          # 布局说明
│   └── TESTING-GUIDE.md            # 测试指南
│
├── 🤖 GitHub Actions
│   └── .github/workflows/
│       └── data-quality.yml        # 数据质量工作流 ⭐
│
├── 📦 归档文件
│   └── archives/
│       └── Chiengmai-backups.tar.gz # 备份压缩包
│
├── ⚙️ 配置文件
│   ├── .gitignore                  # Git 忽略规则
│   ├── .env.example                # 环境变量示例
│   └── LICENSE                     # 开源协议
│
└── 🖼️ 资源文件
    ├── assets/                     # 图片等资源
    └── uploads/                    # 用户上传的图片
```

---

## 📄 文件组织

### 核心应用文件

#### [admin.html](./admin.html)
**用途**: 活动管理后台

**功能**:
- 活动列表展示
- 创建/编辑/删除活动
- 图片拖拽上传
- 状态管理
- 数据验证

**关键功能**:
```javascript
// 状态管理
function saveAsDraft() { /* 保存为草稿 */ }
function publishActivity() { /* 发布活动 */ }

// 图片上传
function handleImageUpload(file) { /* 处理图片上传 */ }

// 数据验证
function validateActivity(activity) { /* 验证活动数据 */ }
```

---

#### [index.html](./index.html)
**用途**: 活动展示前台

**功能**:
- 活动列表展示
- 分类筛选
- 状态筛选
- 活动详情查看
- 响应式布局

---

#### [debug_admin.html](./debug_admin.html)
**用途**: 调试工具

**功能**:
- 数据验证
- 问题诊断
- 日志查看
- 测试工具

---

### 数据文件

#### [data/items.json](./data/items.json)
**用途**: 活动数据主文件

**数据结构**:
```json
{
  "activities": [
    {
      "id": "unique-id",
      "title": "活动标题",
      "description": "活动描述",
      "category": "市集",
      "status": "ongoing",
      "startDate": "2026-01-01",
      "endDate": "2026-12-31",
      "images": ["url1", "url2"],
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "version": "2.2.0",
  "lastUpdated": "2026-02-25T00:00:00Z"
}
```

**注意事项**:
- ⚠️ 所有修改都会自动备份
- ⚠️ 修改前请运行数据验证
- ⚠️ 遵循 JSON 格式规范

---

### 自动化脚本

#### [scripts/test-framework.mjs](./scripts/test-framework.mjs)
**用途**: 统一测试框架

**功能**:
- 数据完整性检查
- 描述重复检测
- 状态验证
- 生成测试报告

**使用方式**:
```bash
node scripts/test-framework.mjs
```

**输出示例**:
```
✅ 数据完整性检查: 通过
⚠️  发现 3 个重复描述
✅ 状态验证: 通过
```

---

#### [scripts/auto-fix-all.mjs](./scripts/auto-fix-all.mjs)
**用途**: 自动修复所有问题

**功能**:
- 修复重复描述
- 补充缺失字段
- 统一数据格式
- 自动备份

**使用方式**:
```bash
node scripts/auto-fix-all.mjs
```

**安全机制**:
- 修复前自动备份
- 确认后执行修复
- 可回滚修复

---

#### [scripts/smart-fix-descriptions.mjs](./scripts/smart-fix-descriptions.mjs)
**用途**: 智能描述修复

**功能**:
- 检测重复描述
- 保留最佳版本
- 删除重复项

**算法**:
```javascript
// 保留最长、最详细的描述
function keepBestDescription(duplicates) {
    return duplicates.sort((a, b) =>
        b.description.length - a.description.length
    )[0];
}
```

---

### GitHub Actions

#### [.github/workflows/data-quality.yml](./.github/workflows/data-quality.yml)
**用途**: 数据质量自动检查

**触发条件**:
- Push 到 main 分支
- Pull Request 创建
- 手动触发

**检查项目**:
- 数据完整性
- 描述重复
- JSON 格式
- 文件大小

**失败处理**:
- 添加 PR 评论
- 发送通知
- 阻止合并

---

## 🏗️ 模块说明

### 核心模块架构

```
┌─────────────────────────────────────────┐
│            UI 层 (HTML)                 │
├─────────────────────────────────────────┤
│  • index.html (前台展示)                │
│  • admin.html (管理后台)                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         逻辑层 (JavaScript)             │
├─────────────────────────────────────────┤
│  • 数据管理模块                          │
│  • 表单处理模块                          │
│  • 图片上传模块                          │
│  • 状态管理模块                          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         数据层 (JSON)                   │
├─────────────────────────────────────────┤
│  • items.json (主数据)                   │
│  • LocalStorage (缓存)                   │
│  • 备份文件 (历史记录)                   │
└─────────────────────────────────────────┘
```

### 数据管理模块

**职责**:
- 数据加载和保存
- 数据验证和转换
- 自动备份

**关键函数**:
```javascript
loadData()              // 加载数据
saveData(data)          // 保存数据
validateData(data)      // 验证数据
backupData()            // 备份数据
```

---

### 图片上传模块

**职责**:
- 文件类型验证
- 文件大小检查
- 图片预览
- 上传进度

**关键函数**:
```javascript
handleFileSelect(file)      // 处理文件选择
validateImage(file)         // 验证图片
previewImage(file)          // 预览图片
uploadImage(file)           // 上传图片
```

---

### 状态管理模块

**职责**:
- 状态转换
- 状态验证
- 状态更新

**状态机**:
```javascript
const STATUS_MACHINE = {
    draft: {
        next: ['pending', 'expired'],
        color: '#9E9E9E'
    },
    pending: {
        next: ['ongoing', 'expired'],
        color: '#FFA726'
    },
    ongoing: {
        next: ['expired'],
        color: '#66BB6A'
    },
    expired: {
        next: [],
        color: '#EF5350'
    }
};
```

---

## 🔄 数据流向

### 数据保存流程

```
用户操作 (点击保存)
    │
    ▼
前端验证 (表单验证)
    │
    ▼
构建数据对象
    │
    ▼
保存到 LocalStorage (缓存)
    │
    ▼
写入 items.json (持久化)
    │
    ▼
自动备份 (备份文件)
    │
    ▼
显示成功提示
```

### 数据验证流程

```
读取 items.json
    │
    ▼
解析 JSON
    │
    ▼
运行验证规则
    │
    ├─→ 完整性检查
    ├─→ 重复检测
    └─→ 格式验证
    │
    ▼
生成报告
    │
    ▼
自动修复 (可选)
```

---

## 📊 文件大小统计

| 类型 | 大小范围 | 说明 |
|------|----------|------|
| HTML 文件 | ~50-100 KB | 包含内联 CSS 和 JS |
| JSON 数据 | ~10-50 KB | 取决于活动数量 |
| 脚本文件 | ~5-20 KB | ES Module 格式 |
| 文档文件 | ~5-30 KB | Markdown 格式 |

---

## 🧪 测试结构

### 测试文件组织

```
scripts/
├── test-framework.mjs           # 主测试框架
├── auto-fix-all.mjs             # 自动修复
├── smart-fix-descriptions.mjs   # 智能修复
└── comprehensive-description-check.mjs  # 描述检查
```

### 测试覆盖

| 模块 | 测试覆盖 | 状态 |
|------|----------|------|
| 数据验证 | 90% | ✅ |
| 状态管理 | 85% | ✅ |
| 图片上传 | 70% | 🟡 |
| 表单处理 | 80% | ✅ |

---

## 🎯 扩展指南

### 添加新功能

#### 1. 添加新的活动分类

```javascript
// 在 admin.html 中添加
const CATEGORIES = [
    '市集',
    '音乐',
    '冥想',
    '运动',
    '舞蹈',
    '瑜伽',
    '文化艺术',
    '健身',
    '泰拳',
    '徒步',
    '新分类'  // 添加新分类
];
```

#### 2. 添加新的状态

```javascript
// 定义新状态
const NEW_STATUS = {
    value: 'cancelled',
    label: '已取消',
    color: '#9E9E9E',
    emoji: '❌'
};

// 更新状态机
STATUS_MACHINE.cancelled = {
    next: [],
    color: '#9E9E9E'
};
```

#### 3. 添加新的验证规则

```javascript
function customValidation(activity) {
    const errors = [];

    // 自定义验证逻辑
    if (activity.price < 0) {
        errors.push('Price cannot be negative');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
```

---

## 🚀 部署结构

### 本地开发

```
Chiengmai/
├── index.html          # 访问 http://localhost:8000
├── admin.html          # 访问 http://localhost:8000/admin.html
└── data/
    └── items.json      # 数据文件

启动方式:
python3 -m http.server 8000
```

### 生产部署

```
┌─────────────┐
│  Vercel     │  ← 推荐平台
├─────────────┤
│  GitHub Pages  ← 免费托管
├─────────────┤
│  Netlify    │  ← 其他选择
└─────────────┘
```

---

**文档版本**: v1.0.0
**最后更新**: 2026-02-25
**维护者**: Chiengmai Team
