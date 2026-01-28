# 项目架构文档

## 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [核心功能](#核心功能)
- [数据流](#数据流)
- [部署架构](#部署架构)

---

## 技术栈

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **Vanilla JavaScript** - 业务逻辑
- **响应式设计** - 移动端适配

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **Excel解析** - 数据处理

### 数据存储
- **JSON文件** - 本地数据存储
- **Excel同步** - 飞书表格集成

### 测试
- **Playwright** - E2E测试
- **Vitest** - 单元测试

---

## 项目结构

\`\`\`
Chiengmai/
├── public/                 # 前端静态文件
│   ├── index.html         # 主应用页面
│   ├── admin.html         # 后台管理页面
│   └── test-*.html        # 测试页面
├── scripts/               # 工具脚本
│   ├── import-excel-*.mjs # Excel导入
│   └── watch-excel.mjs    # 文件监控
├── scraper/               # 数据爬虫
│   └── excel-to-*.js      # 数据同步
├── data/                  # 数据目录（本地）
│   └── items.json         # 活动数据
├── docs/                  # 公开文档
│   ├── architecture/      # 架构文档
│   └── guides/            # 使用指南
├── internal-notes/        # 私有笔记（不提交）
└── .env.example           # 环境变量模板
\`\`\`

---

## 核心功能

### 1. 活动查询
- 按日期筛选活动
- 按分类查看（兴趣班、市集、音乐等）
- 实时数据更新

### 2. 数据管理
- Excel导入功能
- 飞书表格同步
- 自动数据验证

### 3. 后台管理
- 活动CRUD操作
- 分类管理
- 数据统计

---

## 数据流

\`\`\`
Excel文件 → 监控脚本 → 数据解析 → JSON存储 → 前端展示 → 用户交互
                                              ↑
飞书表格 → 同步脚本 ──────────────────────────┘
\`\`\`

---

## 部署架构

### 开发环境
\`\`\`bash
# 前端开发服务器
npm run dev:client  # http://localhost:5173

# 后端API服务器
npm run dev:server  # http://localhost:3000
\`\`\`

### 生产环境
- **前端**: 静态文件托管
- **后端**: Node.js服务器
- **数据**: 本地JSON + 飞书备份

---

## 环境变量

项目使用环境变量管理敏感配置：

\`\`\`bash
# 复制模板
cp .env.example .env

# 编辑配置
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
# ... 其他配置
\`\`\`

⚠️ **重要**: 
- 永远不要将 \`.env\` 文件提交到Git
- 使用 \`.env.example\` 作为模板

---

**最后更新**: 2026-01-29
**维护者**: 项目团队
