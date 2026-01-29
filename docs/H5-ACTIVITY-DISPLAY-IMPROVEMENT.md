# H5移动端活动展示优化方案

**创建时间**: 2026-01-29
**需求**: 优化移动端活动展示交互体验

---

## 📱 当前问题

### 当前行为

1. **点击日期后**：筛选显示当天活动（隐藏其他天）
2. **返回操作**：需要点击返回按钮才能看到其他活动
3. **用户体验**：
   - ❌ 无法同时看到多天的活动
   - ❌ 需要频繁切换/返回
   - ❌ 缺乏整体视图

### 示意图

```
当前行为:
┌─────────────────────┐
│  日历: [一][二][三]  │
├─────────────────────┤
│  ← 返回  周一活动   │
│  • 活动A            │
│  • 活动B            │
│  (其他天被隐藏)     │
└─────────────────────┘
```

---

## 🎯 优化目标

### 新需求

1. **展示全部活动**：始终显示所有活动，不筛选
2. **当天活动置顶**：选中的当天活动固定在顶部
3. **自动切换高亮**：切换日期时，自动滚动并高亮该天活动
4. **更好的交互**：无需返回按钮，直接点击日期切换

### 示意图

```
优化后:
┌─────────────────────┐
│  日历: [一][二][三]  │ ← 点击任意日期
├─────────────────────┤
│  📅 周一活动 (2个)  │ ← 固定在顶部
│  ⭐ • 活动A (高亮)  │
│  ⭐ • 活动B (高亮)  │
├─────────────────────┤
│  📅 周二活动 (1个)  │
│    • 活动C          │
├─────────────────────┤
│  📅 周三活动 (3个)  │
│    • 活动D          │
│    • 活动E          │
│    • 活动F          │
└─────────────────────┘
```

---

## 🔧 技术实现

### 1. 修改 `renderScheduleList` 函数

**当前逻辑**：
```javascript
function renderScheduleList(activities) {
    const filtered = filterActivities();
    // 根据筛选条件显示活动
}
```

**优化后**：
```javascript
function renderScheduleList(activities, selectedDay = null) {
    // 1. 始终显示所有活动
    // 2. 按日期分组
    // 3. 如果有选中日期，该天的活动放在最前面
    // 4. 为选中的活动添加高亮样式

    const groupedByDay = groupActivitiesByDay(activities);

    if (selectedDay !== null) {
        // 将选中的日期组移到最前面
        const selected = groupedByDay[selectedDay];
        delete groupedByDay[selectedDay];
        return {
            [selectedDay]: selected,
            ...groupedByDay
        };
    }

    return groupedByDay;
}
```

### 2. 创建分组显示函数

```javascript
/**
 * 按日期分组并渲染活动列表
 */
function renderGroupedActivities(activities, selectedDay = null) {
    // 按日期分组
    const grouped = {};
    activities.forEach(act => {
        if (!grouped[act.day]) {
            grouped[act.day] = [];
        }
        grouped[act.day].push(act);
    });

    // 如果有选中的日期，将其移到最前面
    let dayKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    if (selectedDay !== null && grouped[selectedDay]) {
        dayKeys = dayKeys.filter(k => k !== selectedDay);
        dayKeys.unshift(selectedDay); // 插入到开头
    }

    // 渲染HTML
    let html = '';
    dayKeys.forEach(day => {
        const dayActivities = grouped[day];
        const isSelected = day === selectedDay;

        html += `
            <div class="day-group ${isSelected ? 'day-group-selected' : ''}" data-day="${day}">
                <div class="day-group-header">
                    <span class="day-name">${dayNames[day]}</span>
                    <span class="day-count">${dayActivities.length}个活动</span>
                </div>
                <div class="day-group-activities">
                    ${dayActivities.map(act => `
                        <div class="schedule-item ${isSelected ? 'activity-highlight' : ''}" data-activity-id="${act.id}">
                            <!-- 活动内容 -->
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    return html;
}
```

### 3. 添加CSS样式

```css
/* 日期分组容器 */
.day-group {
    margin-bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
}

/* 选中的日期组 - 固定在顶部 */
.day-group-selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    position: sticky;
    top: 120px; /* 根据header高度调整 */
    z-index: 100;
}

/* 日期组头部 */
.day-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f5f5f5;
    border-left: 4px solid #667eea;
    font-weight: 600;
}

.day-group-selected .day-group-header {
    background: rgba(255, 255, 255, 0.95);
    color: #667eea;
}

/* 高亮活动卡片 */
.activity-highlight {
    background: #fff;
    border: 2px solid #667eea !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 活动卡片动画 */
.schedule-item {
    transition: all 0.3s ease;
}

.schedule-item:hover {
    transform: translateX(4px);
}
```

### 4. 修改 `toggleDayFilter` 函数

```javascript
function toggleDayFilter(day) {
    console.log('🗓️ 点击日期筛选:', day, `(${dayNames[day]})`);

    if (currentFilters.day === day) {
        // 再次点击取消选中
        console.log('✋ 取消日期高亮');
        currentFilters.day = null;
        lastSelectedDay = null;
    } else {
        // 选中新日期
        console.log('✅ 设置日期高亮:', day);
        currentFilters.day = day;
        lastSelectedDay = day;

        // 🆕 自动滚动到该日期组
        setTimeout(() => {
            const dayGroup = document.querySelector(`.day-group[data-day="${day}"]`);
            if (dayGroup) {
                dayGroup.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // 添加脉冲动画
                dayGroup.style.animation = 'pulse 0.6s ease';
                setTimeout(() => {
                    dayGroup.style.animation = '';
                }, 600);
            }
        }, 100);
    }

    // 更新视图（使用新的分组渲染）
    updateViews();
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
}
```

### 5. 移动端优化

```css
@media (max-width: 768px) {
    /* 选中日期组在移动端更突出 */
    .day-group-selected {
        top: 120px;
        margin: 0 -8px; /* 抵消padding */
        border-radius: 12px;
    }

    /* 日期组头部更紧凑 */
    .day-group-header {
        padding: 10px 12px;
        font-size: 14px;
    }

    /* 活动卡片间距优化 */
    .day-group-activities {
        padding: 0 8px;
    }

    /* 活动卡片 */
    .schedule-item {
        margin-bottom: 8px;
    }
}
```

---

## 📊 交互流程对比

### 修改前

```
用户操作流程:
1. 点击"周一"
2. 页面切换到详情视图
3. 只看到周一的活动
4. 想看周二的活动
5. 点击返回按钮 ← 烦恼
6. 再次点击"周二"
7. 只看到周二的活动
```

### 修改后

```
用户操作流程:
1. 点击"周一"
2. 周一活动自动滚动到顶部并高亮 ✅
3. 同时能看到所有其他天的活动 ✅
4. 想看周二的活动
5. 直接点击"周二" ← 方便
6. 周二活动自动滚动到顶部并高亮 ✅
7. 无需返回，所有活动都可见 ✅
```

---

## 🎁 额外优化

### 优化1: 快速跳转按钮

```javascript
// 在选中日期组添加"跳转到下一个活动日"按钮
function addQuickNavigation() {
    if (currentFilters.day !== null) {
        const nextDay = findNextDayWithActivities(currentFilters.day);
        if (nextDay !== null) {
            return `
                <button class="next-day-btn" onclick="toggleDayFilter(${nextDay})">
                    跳转到${dayNames[nextDay]} →
                </button>
            `;
        }
    }
    return '';
}
```

### 优化2: 活动数量提示

```javascript
// 在日历格子显示活动数量
function renderDayCell(day, activities) {
    const count = activities.filter(act => act.day === day).length;
    return `
        <div class="day-cell" onclick="toggleDayFilter(${day})">
            <div class="day-name">${dayNames[day]}</div>
            <div class="day-activity-count">${count}个</div>
        </div>
    `;
}
```

### 优化3: 平滑滚动动画

```css
/* 平滑滚动到选中日期 */
html {
    scroll-behavior: smooth;
}

/* 选中日期组的渐入动画 */
.day-group-selected {
    animation: slideDown 0.4s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

## ✅ 实现检查清单

### 核心功能

- [ ] 修改 `renderScheduleList` 支持分组显示
- [ ] 创建 `renderGroupedActivities` 函数
- [ ] 添加 `.day-group` 相关CSS样式
- [ ] 修改 `toggleDayFilter` 实现自动滚动
- [ ] 添加高亮动画效果

### 移动端优化

- [ ] 调整sticky定位高度
- [ ] 优化触摸目标尺寸
- [ ] 测试滚动性能
- [ ] 优化动画流畅度

### 测试验证

- [ ] 点击日期后正确高亮
- [ ] 滚动时选中日期保持固定
- [ ] 切换日期时平滑过渡
- [ ] 所有活动都可见
- [ ] 移动端触摸体验良好

---

## 🚀 实现步骤

### 步骤1: 创建新函数

在 `index.html` 中添加 `renderGroupedActivities` 函数

### 步骤2: 修改现有函数

更新 `renderScheduleList` 和 `toggleDayFilter`

### 步骤3: 添加CSS样式

添加分组和高亮样式

### 步骤4: 测试验证

在移动端测试交互效果

---

**创建时间**: 2026-01-29
**优先级**: P0 (高优先级用户体验改进)
**预计影响**: 显著改善移动端活动浏览体验
