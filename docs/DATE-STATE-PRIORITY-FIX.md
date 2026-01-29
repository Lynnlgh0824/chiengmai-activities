# 🎯 日期按钮状态优先级修复

**日期**: 2026-01-30
**问题**: today 和 selected 使用了同一种视觉语言，看起来像 bug
**原则**: `selected > today > normal`

---

## ❌ 修复前的问题

### 视觉混乱
```
今天（未选中）→ 黄色边框
今天（已选中）→ 蓝色背景 + 黄色边框 + 黄色外发光 ❌
其他日期（已选中）→ 蓝色背景
```

**问题**：
- 今天被选中时，同时表现了 `today` 和 `selected` 两种状态
- 视觉上无法区分"今天被选中"和"其他日期被选中"
- 违反了状态优先级原则

---

## ✅ 修复后的效果

### 状态优先级：selected > today > normal

```
今天（未选中）→ 黄色边框（today 标记）
今天（已选中）→ 纯蓝色选中样式（不显示 today 标记）✅
其他日期（已选中）→ 纯蓝色选中样式
```

**核心逻辑**：
- 如果日期被选中 → 只表现为 `selected` 状态
- `today` 只是"参考态"，不是强态
- 被选中的今天与其他被选中的日期视觉完全一致

---

## 🔧 修改内容

### 1. JavaScript 逻辑修复

#### `createDayCell` 函数（第 6286-6291 行）

**修改前**：
```javascript
const isSelectedDay = currentFilters.day === day;
const isToday = isDayToday(day);

// ❌ 同时添加 today 和 selected-day
class="day-cell ${isToday ? 'today' : ''} ${isSelectedDay ? 'selected-day' : ''}"
```

**修改后**：
```javascript
const isSelectedDay = currentFilters.day === day;
const isToday = isDayToday(day);

// ✅ 状态优先级：selected > today > normal
const shouldShowToday = isToday && !isSelectedDay;

class="day-cell ${shouldShowToday ? 'today' : ''} ${isSelectedDay ? 'selected-day' : ''}"
```

#### `updateDateHeaders` 函数（第 7013-7035 行）

**修改前**：
```javascript
weekDates.forEach(dateInfo => {
    const todayClass = dateInfo.isToday ? ' today-header' : '';
    // ❌ 不考虑 selected 状态
});
```

**修改后**：
```javascript
weekDates.forEach(dateInfo => {
    // ✅ 状态优先级：selected > today > normal
    const isToday = dateInfo.isToday;
    const isSelected = currentFilters.day === dateInfo.day;
    const shouldShowToday = isToday && !isSelected;
    const todayClass = shouldShowToday ? ' today-header' : '';
});
```

---

### 2. CSS 样式清理

#### 删除混合状态样式

**删除的 CSS**：
```css
/* ❌ 已删除 - 移动端和PC端混合状态样式 */
.day-cell.today.selected-day { ... }
.date-cell-header.today-header.selected-day { ... }
.day-cell.today.selected-day .day-name { ... }
.date-cell-header.today-header.selected-day { ... }
```

**原因**：
- 现在不会再同时存在 `today` 和 `selected-day` 两个 class
- 混合状态样式已经无效，应该删除

---

## 📊 测试验证

### 测试场景

1. **未选择任何日期**
   - 今天显示黄色边框 ✅
   - 其他日期普通显示 ✅

2. **点击今天**
   - 只显示蓝色选中样式 ✅
   - 黄色边框消失 ✅
   - 视觉上与其他选中日期一致 ✅

3. **点击其他日期**
   - 今天显示黄色边框 ✅
   - 被选中的日期显示蓝色选中样式 ✅
   - 视觉层级清晰 ✅

4. **在不同 Tab 切换**
   - 兴趣班、市集、音乐 Tab 都遵循相同规则 ✅
   - 状态切换流畅无闪烁 ✅

---

## 🧠 设计原则

### 状态优先级

```javascript
selected > today > normal
```

### 实现逻辑

```javascript
// ✅ 正确的判断逻辑
const shouldShowToday = isToday && !isSelected;
```

### CSS 选择器优先级

```css
/* ✅ 单一状态样式 */
.day-cell.selected-day { ... }  /* 优先级最高 */
.day-cell.today { ... }         /* 优先级次之 */
.day-cell { ... }                /* 默认状态 */
```

---

## 📁 修改的文件

- **`public/index.html`**
  - 修改 `createDayCell` 函数（第 6286-6332 行）
  - 修改 `updateDateHeaders` 函数（第 7013-7035 行）
  - 删除混合状态 CSS 样式（4 处）

---

## 🎉 修复效果

### Before（修复前）
- 今天被选中：蓝色 + 黄色边框 + 黄色外发光 ❌
- 视觉混乱，无法区分状态

### After（修复后）
- 今天被选中：纯蓝色选中样式 ✅
- 视觉清晰，状态优先级明确

---

**创建时间**: 2026-01-30
**维护者**: Claude Code
