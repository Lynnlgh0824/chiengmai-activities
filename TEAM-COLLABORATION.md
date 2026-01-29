# 团队协作规范

> **适用范围**：所有参与 Chiengmai 项目开发的人员
>
> **更新日期**：2025-01-30
> **下次审查**：每季度第一个周五

---

## 📅 定期会议节奏

### 1. 每日代码审查（Daily Code Review）
**时间**：每天下午 5:00 - 5:15（15分钟）
**参与者**：所有开发者
**形式**：异步或同步

**议程**：
- [ ] 查看今日提交的 Pull Request
- [ ] 检查是否符合 [CHECKLIST.md](./CHECKLIST.md) 标准
- [ ] 提出改进建议
- [ ] 确认无重大问题后合并

**输出**：
- 审查记录（评论在 PR 中）
- 发现的问题记录到 [TECHNICAL-DEBT.md](./TECHNICAL-DEBT.md)

---

### 2. 每周技术分享（Weekly Tech Talk）
**时间**：每周五下午 4:00 - 4:15（15分钟）
**参与者**：所有开发者 + 可选其他团队成员
**形式**：轮流主讲

**主题**：
- 本周遇到的 Bug 和解决方案
- 新学到的技术或工具
- 代码重构经验
- 性能优化案例
- 安全漏洞和防范

**输出**：
- 简短的分享记录（3-5 条要点）
- 可选：更新到团队 Wiki

---

### 3. 每两周技术债务审查（Bi-weekly Debt Review）
**时间**：隔周周三下午 4:00 - 4:30（30分钟）
**参与者**：所有开发者
**形式**：团队讨论

**议程**：
- [ ] 回顾 [TECHNICAL-DEBT.md](./TECHNICAL-DEBT.md) 中的债务
- [ ] 评估优先级是否变化
- [ ] 选择下周要偿还的 1-2 项债务
- [ ] 分配负责人和时间表
- [ ] 跟踪进行中的债务进展

**输出**：
- 更新 `TECHNICAL-DEBT.md` 的状态
- 确定下周的偿还计划

---

### 4. 每季度重构周（Quarterly Refactoring Week）
**时间**：每季度最后一周的周一到周五
**参与者**：所有开发者
**形式**：全员参与

**目标**：
- 偿还高优先级的技术债务
- 清理死代码和注释
- 更新文档
- 性能优化

**活动**：
- 周一：规划和分工
- 周二-四：执行重构
- 周五：总结和分享

**输出**：
- 重构报告（改进成果）
- 更新相关文档

---

## 🤝 代码审查规范

### Pull Request 流程

#### 提交前（作者）
1. **自检**：运行 [CHECKLIST.md](./CHECKLIST.md)
2. **测试**：本地测试所有修改的功能
3. **文档**：更新相关文档（README、CHANGELOG）
4. **提交信息**：遵循 Git 提交信息规范

#### 审查中（审查者）
1. **功能性**：代码是否实现了预期功能？
2. **安全性**：是否有安全漏洞？
3. **性能**：是否有性能问题？
4. **可维护性**：代码是否清晰、易读、易维护？
5. **测试**：是否包含足够的测试？

#### 审查后
- **通过**：合并到主分支，删除分支
- **修改后通过**：确认修改后合并
- **拒绝**：说明原因，等待修改后重新提交

### 审查响应时间（SLA）
- 紧急修复：2 小时内响应
- 常规功能：1 个工作日内响应
- 重构优化：2 个工作日内响应

---

## 📝 代码规范

### Git 提交信息规范

**格式**：
```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Name <email>
```

**Type 类型**：
- `feat`：新功能
- `fix`：修复 Bug
- `refactor`：重构（既不是新功能也不是修复）
- `perf`：性能优化
- `style`：代码格式调整（不影响功能）
- `docs`：文档更新
- `test`：添加或修改测试
- `chore`：构建过程或辅助工具的变动
- `revert`：回退之前的提交

**Scope 范围**：
- `activities`：活动相关功能
- `filter`：筛选功能
- `calendar`：日历功能
- `mobile`：移动端适配
- `css`：样式调整
- `docs`：文档

**Subject 主题**：
- 使用中文，简洁明了（< 50 字）
- 说明做了什么，不是怎么做

**Body 正文**：
- 详细说明修改的内容
- 说明修改的原因和背景
- 列出相关的 Issue 或 PR

**示例**：
```
fix(filter): 修复移动端自动选择周一的竞态条件问题

问题：Tab 切换时可能自动选中周一，因为 IntersectionObserver
在 isPageFirstLoad 保护失效之前就被触发。

修复方案：
1. 在 initH5ScrollAutoSelect 函数开头添加 isPageFirstLoad 检查
2. 在 IntersectionObserver 回调中添加二次 isPageFirstLoad 检查
3. 将 initH5ScrollAutoSelect 的调用延迟从 300ms 增加到 1000ms

确保：Observer 初始化在 Tab 切换保护（800ms）之后才执行。

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

### 代码风格指南

#### 命名规范
```javascript
// ✅ 变量名：小驼峰
const isActive = true;
const currentDate = new Date();

// ✅ 常量：大写字母 + 下划线
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// ✅ 函数名：小驼峰 + 动词开头
function getActivities() { }
function renderCalendar() { }
function updateFilterStatus() { }

// ✅ 布尔值：is/has/can 开头
const isLoading = false;
const hasPermission = true;
const canEdit = false;

// ✅ 事件处理器：on/handle 开头
function onDateClick(day) { }
function handleSearchSubmit() { }
```

#### 注释规范
```javascript
// ✅ 函数注释：说明目的、参数、返回值
/**
 * 过滤活动数据
 * @param {Array} activities - 原始活动数据
 * @param {Object} filters - 筛选条件
 * @returns {Array} 过滤后的活动数据
 */
function filterActivities(activities, filters) {
    // ...
}

// ✅ 行内注释：解释"为什么"而非"是什么"
// 使用 relative 定位而非 fixed，避免移动端键盘遮挡问题
position: relative !important;

// ❌ 避免无意义的注释
// 设置 isPageFirstLoad 为 true（代码本身已经清楚）
```

---

## 🛡️ 质量保证流程

### 开发流程
1. **创建分支**：从 `main` 分支创建功能分支
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **开发和自测**：
   - 按照 [CHECKLIST.md](./CHECKLIST.md) 自检
   - 本地测试所有修改的功能
   - 运行自动化测试（如果有）

3. **提交代码**：
   - 提交到功能分支
   - 推送到远程仓库
   - 创建 Pull Request

4. **代码审查**：
   - 至少 1 名审查者批准
   - 所有检查项通过
   - 解决所有审查意见

5. **合并代码**：
   - 合并到 `main` 分支
   - 删除功能分支
   - 部署到测试环境

### 发布流程
1. **测试环境验证**：在测试环境完整测试
2. **打 Tag**：为正式版本打标签（如 v1.0.0）
3. **部署到生产**：推送到生产环境
4. **监控**：观察日志和错误报告
5. **回滚计划**：如有问题立即回滚

---

## 📚 文档规范

### 代码注释
- [ ] 复杂逻辑必须有注释说明
- [ ] 公共 API 必须有 JSDoc 注释
- [ ] "为什么这样做" > "做了什么"
- [ ] 注释与代码保持同步

### 项目文档
- [ ] README.md：项目介绍、快速开始、部署指南
- [ ] CHANGELOG.md：版本更新记录
- [ ] docs/removed-components.md：已移除组件记录
- [ ] TECHNICAL-DEBT.md：技术债务日志
- [ ] CHECKLIST.md：代码审查检查清单

### 变更文档
- [ ] 每次重大更新 CHANGELOG.md
- [ ] 破坏性变更提前通知
- [ ] API 变更更新相关文档

---

## 🐛 问题处理流程

### Bug 报告
1. **发现问题**：
   - 用户反馈
   - 测试发现
   - 监控告警

2. **创建 Issue**：
   - 标题：清晰描述问题
   - 复现步骤：详细说明如何重现
   - 预期行为：应该是什么样
   - 实际行为：实际是什么样
   - 环境信息：浏览器、设备、系统版本

3. **分配负责人**：
   - 紧急问题：立即处理
   - 普通问题：3 天内处理
   - 低优先级问题：1 周内处理

4. **修复和验证**：
   - 修复代码
   - 添加测试（避免回归）
   - 审查和合并

5. **关闭 Issue**：
   - 说明修复方案
   - 关闭 Issue
   - 通知报告人

---

## 🎯 团队价值观

### 1. 代码质量 > 开发速度
> "慢即是快，一次做对比重做三次。"

### 2. 防御性编程
> "相信用户会犯错，相信网络会失败，相信代码会有 Bug。"

### 3. 持续重构
> "代码债务必须定期偿还，否则会产生利息（更多 Bug）。"

### 4. 知识共享
> "没有文档的代码等于没有代码，没有分享的知识等于没有知识。"

### 5. 用户优先
> "技术是为了服务用户，而不是炫技。简单、可用、稳定。"

---

## 📊 团队协作工具

### 沟通工具
- **即时通讯**：微信/钉钉群
- **代码审查**：GitHub Pull Request
- **文档协作**：GitHub Wiki
- **项目管理**：GitHub Issues / Projects

### 开发工具
- **代码编辑器**：VS Code（推荐插件：ESLint、Prettier）
- **版本控制**：Git + GitHub
- **自动化检查**：Pre-commit Hook
- **CI/CD**：Cloudflare Pages（自动部署）

### 监控工具
- **错误监控**：（待添加，如 Sentry）
- **性能监控**：Lighthouse
- **用户反馈**：直接沟通或 GitHub Issues

---

## 📈 持续改进

### 月度回顾
每月最后一个周五下午：
- 回顾本月的工作成果
- 讨论遇到的问题和解决方案
- 收集团队反馈
- 改进协作流程

### 季度总结
每季度最后一周：
- 总结季度工作
- 统计修复的 Bug 数量
- 统计技术债务变化
- 规划下季度目标

---

## 🔗 相关文档

- [CHECKLIST.md](./CHECKLIST.md) - 代码审查检查清单
- [TECHNICAL-DEBT.md](./TECHNICAL-DEBT.md) - 技术债务日志
- [docs/removed-components.md](./docs/removed-components.md) - 已移除组件记录
- [README.md](./README.md) - 项目说明

---

## 📞 联系方式

- **技术问题**：在 GitHub Issues 提问
- **流程问题**：联系项目负责人
- **紧急情况**：直接电话联系

---

**更新日期**：2025-01-30
**下次审查**：2025-04-30

---

**最后提醒**：

> "规范是为了约束行为，但更是为了解放创造力。"
>
> "遵守规范可以让团队协作更顺畅，让每个人都能专注于创造价值。"
