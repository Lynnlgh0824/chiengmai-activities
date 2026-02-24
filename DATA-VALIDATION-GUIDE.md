# 📊 活动数据校验指南

## 简介

`data-validator.mjs` 是一个自动化的活动数据校验工具，用于检查活动数据的准确性、完整性和一致性。

## 使用方法

### 快速校验

```bash
# 方式一：使用 npm 脚本（推荐）
npm run validate

# 方式二：直接运行
node scripts/data-validator.mjs
```

### 校验输出

校验工具会输出以下信息：

```
📊 开始数据校验...

📁 已加载 45 条活动数据

📋 校验概览:
   ✅ 通过: 1/45
   ❌ 错误: 0
   ⚠️  警告: 44
   ℹ️  信息: 51
```

## 校验规则

### 🔴 错误级别（必须修复）

| 规则 | 说明 | 示例 |
|------|------|------|
| **必填字段缺失** | 缺少 id、title、category 等 | `id` 为空 |
| **状态值无效** | status 不是有效值 | status = "未知" |
| **星期数据无效** | weekdays 包含无效值 | weekdays = ["周八"] |
| **链接格式错误** | sourceLink 格式不正确 | sourceLink = "www.example.com" |

### 🟡 警告级别（建议修复）

| 规则 | 说明 | 示例 |
|------|------|------|
| **标题过短/过长** | 标题 < 3 或 > 100 字符 | title = "游泳" |
| **描述过短/过长** | 描述 < 20 或 > 2000 字符 | description = "很好" |
| **价格格式不完整** | 缺少数字/货币/单位 | price = "免费" |
| **标题重复** | 多个活动使用相同标题 | 两个活动都叫"游泳" |
| **描述重复** | 多个活动使用相同描述 | 复制粘贴导致 |

### 🔵 信息级别（可选优化）

| 规则 | 说明 | 示例 |
|------|------|------|
| **缺少官网链接** | sourceLink 为空 | 85% 活动无官网 |
| **缺少联系方式** | 需要预约但无电话 | requireBooking="是" |
| **地点信息简略** | 地点描述过于简单 | location = "健身房" |

## 当前数据质量

### 📊 统计概览

```
总活动数: 45
质量评分: B+ (有改进空间)
```

### 🎯 优先改进项目

| 优先级 | 问题 | 影响数量 | 建议 |
|--------|------|---------|------|
| 🔴 高 | 价格格式不规范 | 40 | 统一为"XX泰铢/单位" |
| 🟡 中 | 缺少官网链接 | 38 | 补充 Facebook/官网 |
| 🟡 中 | 标题过短 | 4 | 补充描述性词语 |
| 🟢 低 | 缺少联系方式 | 10 | 添加电话/社交账号 |

## 校验规则详解

### 1. 价格格式规范

**正确格式**:
```json
{
  "price": "30-50泰铢/50个球"
}
{
  "price": "约250泰铢/天（含食宿）"
}
```

**不规范格式**:
```json
{
  "price": "免费"  // ❌ 缺少数字
}
{
  "price": "100/小时"  // ❌ 缺少货币单位
}
```

### 2. 标题规范

**正确格式**:
```json
{
  "title": "高尔夫练习场 (Lanna Golf Club)"
}
{
  "title": "实弹射击 - Thai Green Shooting Range"
}
```

**不规范格式**:
```json
{
  "title": "游泳"  // ⚠️ 过短，建议补充地点或特色
}
```

### 3. 分类规范

**有效分类列表**:
```
运动, 健身, 瑜伽, 舞蹈, 泰拳, 徒步, 冥想,
文化艺术, 音乐, 市集, 语言交换, 英语角, 咏春拳
```

### 4. 星期数据规范

**有效星期值**:
```
周一, 周二, 周三, 周四, 周五, 周六, 周日,
无固定时间, 工作日, 周末
```

## 常见问题修复

### 问题 1: 价格格式不规范

**原数据**:
```json
{
  "price": "免费"
}
```

**修复后**:
```json
{
  "price": "免费（0泰铢）",
  "minPrice": 0,
  "maxPrice": 0
}
```

### 问题 2: 标题过短

**原数据**:
```json
{
  "title": "游泳",
  "location": "700th Stadium"
}
```

**修复后**:
```json
{
  "title": "游泳 - 700th Stadium",
  "location": "700th Stadium"
}
```

### 问题 3: 缺少官网链接

**原数据**:
```json
{
  "sourceLink": ""
}
```

**修复后**:
```json
{
  "sourceLink": "https://www.facebook.com/groups/xxxxx"
}
```

## 自动修复脚本

部分问题可以使用自动修复脚本：

```bash
# 运行所有自动修复
node scripts/auto-fix-all.mjs

# 智能修复描述重复
node scripts/smart-fix-descriptions.mjs
```

## 集成到工作流

### Pre-commit 钩子

项目已配置 pre-commit 钩子，提交时自动运行校验：

```bash
git add data/items.json
git commit -m "update: 添加新活动"
# → 自动运行数据校验
```

### GitHub Actions

在 `.github/workflows/data-quality.yml` 中配置：

```yaml
name: 数据质量检查
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: 运行数据校验
        run: npm run validate
```

## 数据质量评分

### 评分标准

| 级别 | 条件 |
|------|------|
| A+ | 0 错误, < 5 警告 |
| A | 0 错误, < 10 警告 |
| B+ | 0 错误, < 20 警告 |
| B | 0 错误, < 30 警告 |
| C | 有错误或 > 30 警告 |

### 当前评分: **B+**

```
✅ 0 错误
⚠️ 44 警告 (主要是价格格式)
ℹ️ 51 信息 (主要是缺少官网链接)
```

## 最佳实践

### 1. 添加新活动时

```bash
# 1. 编辑数据
vim data/items.json

# 2. 运行校验
npm run validate

# 3. 修复问题
# ...

# 4. 再次校验
npm run validate

# 5. 提交
git add data/items.json
git commit -m "update: 添加新活动"
```

### 2. 批量更新数据

```bash
# 1. 更新数据
vim data/items.json

# 2. 运行校验
npm run validate

# 3. 查看警告详情
# 根据输出逐个修复

# 4. 重新校验确认
npm run validate
```

### 3. 定期数据审计

```bash
# 每周运行一次全面检查
npm run validate
npm run check-all
```

## 扩展校验规则

如需添加新的校验规则，编辑 `scripts/data-validator.mjs`：

```javascript
const validators = {
  // 添加新规则
  myCustomRule: (item, allItems) => {
    if (/* 条件 */) {
      return {
        type: 'warning',
        field: 'myField',
        message: '问题描述'
      };
    }
    return null;
  }
};
```

## 故障排查

### 问题: 校验器无法运行

```bash
# 检查 Node.js 版本
node --version  # 需要 >= 18

# 重新安装依赖
npm install
```

### 问题: 数据文件未找到

```bash
# 确认文件位置
ls -la data/items.json

# 从正确目录运行
cd /path/to/Chiengmai
npm run validate
```

## 相关文档

- [数据同步指南](DATA-SYNC-GUIDE.md)
- [自动化测试指南](AUTOMATION-GUIDE.md)
- [测试工具对比](TEST-TOOLS-COMPARISON.md)
