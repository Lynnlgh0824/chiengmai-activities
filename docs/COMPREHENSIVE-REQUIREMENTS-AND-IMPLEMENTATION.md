# 清迈项目 - H5移动端优化完整需求分析与实现方案

**创建时间**: 2026-01-29
**文档类型**: 需求分析与详细实现方案
**目标**: 提高修改效率，确保准确理解需求

---

## 📋 需求汇总

### 需求1: H5活动展示优化 ⭐⭐⭐⭐⭐

**原文**: "活动页面在H5下拉页面时，展示全部活动，当天活动置顶在当天日期周几下方，切换周几时，自动切换当天活动，保持高亮"

**理解**:
- 移动端（H5）浏览活动时，不再按日期筛选隐藏其他天的活动
- 改为**分组显示**：按日期分组显示所有活动
- 选中的日期组固定在顶部（sticky定位）
- 点击不同日期时，自动滚动到该日期组并高亮

**当前行为**:
```
点击"周一"后:
┌─────────────────────┐
│  日历: [一][二][三]  │
├─────────────────────┤
│  ← 返回  周一活动   │
│  • 活动A            │
│  • 活动B            │
│  (其他天被隐藏)     │
└─────────────────────┘
```

**目标行为**:
```
点击"周一"后:
┌─────────────────────┐
│  日历: [一][二][三]  │
├─────────────────────┤
│  📅 周一 (2个) ⭐   │ ← sticky固定
│  ⭐ • 活动A         │
│  ⭐ • 活动B         │
├─────────────────────┤
│  📅 周二 (1个)      │
│    • 活动C          │
├─────────────────────┤
│  📅 周三 (3个)      │
│    • 活动D          │
│    • 活动E          │
└─────────────────────┘
```

---

### 需求2: 筛选弹窗分类选项错误 ⭐⭐⭐⭐⭐

**原文**:
- "筛选条件的分类，在H5端时，放到筛选条件的弹窗里"
- "目前筛选条件的弹窗里的分类，不应该是兴趣班、市集"

**理解**:
- 当前筛选弹窗（`#filterSheet`）中的分类选项是错误的
- 当前选项: "全部", "兴趣班", "市集"
- **问题**: "兴趣班"和"市集"是Tab名称，不是分类！
- **正确做法**: 分类应该根据当前Tab动态生成
  - Tab="兴趣班": 显示"舞蹈", "绘画", "武术"等子分类
  - Tab="市集": 显示市集相关的分类（如果有）
  - Tab="音乐": 显示音乐相关的分类（如果有）

**当前代码问题**:
```html
<!-- 错误：把Tab名称当成了分类 -->
<div class="filter-option-grid" id="categoryOptions">
    <div class="filter-option-item selected" data-value="all">全部</div>
    <div class="filter-option-item" data-value="class">兴趣班</div> ❌ 错误！这是Tab
    <div class="filter-option-item" data-value="market">市集</div>   ❌ 错误！这是Tab
</div>
```

**应该改为**:
```html
<!-- 正确：根据当前Tab显示对应的子分类 -->
<div class="filter-option-grid" id="categoryOptions">
    <!-- Tab=兴趣班时 -->
    <div class="filter-option-item selected" data-value="all">全部</div>
    <div class="filter-option-item" data-value="舞蹈">舞蹈</div>     ✅ 正确
    <div class="filter-option-item" data-value="绘画">绘画</div>     ✅ 正确
    <div class="filter-option-item" data-value="武术">武术</div>     ✅ 正确
    ...
</div>
```

---

### 需求3: Tab切换时更新筛选条件 ⭐⭐⭐⭐

**原文**: "筛选条件的变化应该根据tab的切换来更新条件"

**理解**:
- 当用户切换Tab时（如从"兴趣班"切换到"市集"）
- 筛选弹窗中的分类选项应该自动更新
- 每个Tab有自己独立的分类列表

**示例**:
```
用户在"兴趣班"Tab:
- 筛选弹窗显示: 全部 | 舞蹈 | 绘画 | 武术 | ...

用户切换到"市集"Tab:
- 筛选弹窗自动更新为: 全部 | 周末市集 | 夜市 | ... (如果有)

用户切换到"音乐"Tab:
- 筛选弹窗自动更新为: 全部 | 演出 | 工作坊 | ... (如果有)
```

---

## 🔍 当前实现分析

### 当前Tab和Category的关系

**Tab定义** (5个Tab):
```javascript
let currentTab = 0; // 当前选中的Tab

Tab 0: 兴趣班
Tab 1: 市集
Tab 2: 音乐
Tab 3: 灵活时间
Tab 4: 活动网站
```

**当前的Category筛选** (错误):
```javascript
// 当前从所有活动中提取category
function initCategoryFilters() {
    const categories = [...new Set(allActivities.map(a => a.category))]
        .filter(cat => cat !== '市集' && cat !== '音乐');

    // 这会得到: ["舞蹈", "绘画", "武术", ...]
    // 但这些在PC端筛选区显示，H5端筛选弹窗中显示的是Tab名称
}
```

**H5筛选弹窗** (当前的错误实现):
```html
<div class="bottom-sheet" id="filterSheet">
    <div class="sheet-body">
        <!-- 分类筛选 -->
        <div class="filter-group-section">
            <div class="filter-group-title">分类</div>
            <div class="filter-option-grid" id="categoryOptions">
                <div class="filter-option-item selected" data-value="all">全部</div>
                <div class="filter-option-item" data-value="class">兴趣班</div> ❌
                <div class="filter-option-item" data-value="market">市集</div>   ❌
            </div>
        </div>
    </div>
</div>
```

---

## 🎯 详细实现方案

### 方案1: H5活动分组展示（当天置顶）

#### 1.1 创建新的渲染函数

```javascript
/**
 * 按日期分组渲染活动列表（H5专用）
 * @param {Array} activities - 活动数组
 * @param {Number} selectedDay - 选中的日期（0-6）
 * @returns {String} HTML字符串
 */
function renderGroupedActivitiesForH5(activities, selectedDay = null) {
    console.log('📱 H5分组渲染开始，选中日期:', selectedDay);

    // 1. 按日期分组
    const groupedByDay = {};
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    activities.forEach(act => {
        if (!groupedByDay[act.day]) {
            groupedByDay[act.day] = [];
        }
        groupedByDay[act.day].push(act);
    });

    console.log('📊 分组结果:', Object.keys(groupedByDay).map(day =>
        `${dayNames[day]}: ${groupedByDay[day].length}个`
    ).join(', '));

    // 2. 如果有选中日期，将其移到最前面
    let dayKeys = Object.keys(groupedByDay).map(Number).sort((a, b) => a - b);
    if (selectedDay !== null && groupedByDay[selectedDay]) {
        dayKeys = dayKeys.filter(k => k !== selectedDay);
        dayKeys.unshift(selectedDay); // 插入到开头
        console.log('⭐ 选中的日期移到最前:', dayNames[selectedDay]);
    }

    // 3. 渲染HTML
    let html = '';
    dayKeys.forEach((day, index) => {
        const dayActivities = groupedByDay[day];
        const isSelected = day === selectedDay;
        const groupClass = isSelected ? 'day-group day-group-selected' : 'day-group';

        html += `
            <div class="${groupClass}" data-day="${day}">
                <div class="day-group-header">
                    <div class="day-group-title">
                        <span class="day-icon">${getDayIcon(day)}</span>
                        <span class="day-name">${dayNames[day]}</span>
                        ${isSelected ? '<span class="selected-badge">当前</span>' : ''}
                    </div>
                    <span class="day-count">${dayActivities.length}个活动</span>
                </div>
                <div class="day-group-activities">
                    ${dayActivities.map(act => createScheduleItemHTML(act, isSelected)).join('')}
                </div>
            </div>
        `;
    });

    return html;
}

/**
 * 获取日期图标
 */
function getDayIcon(day) {
    const icons = ['🌞', '📅', '📅', '📅', '📅', '📅', '🎉'];
    return icons[day];
}

/**
 * 创建活动卡片HTML（带高亮支持）
 */
function createScheduleItemHTML(act, isHighlighted = false) {
    const highlightClass = isHighlighted ? 'activity-highlight' : '';
    const highlightStar = isHighlighted ? '⭐ ' : '';

    return `
        <div class="schedule-item ${highlightClass}" data-activity-id="${act.id}">
            <div class="schedule-item-header">
                <div class="schedule-item-title">${highlightStar}${cleanTitle(act.title)}</div>
            </div>
            <div class="schedule-item-meta">
                <span class="meta-time">⏰ ${act.time || '灵活时间'}</span>
                <span class="meta-location">📍 ${act.location}</span>
            </div>
            <div class="schedule-item-price">${act.price}</div>
        </div>
    `;
}
```

#### 1.2 修改现有的视图更新函数

```javascript
/**
 * 更新列表视图（支持H5分组显示）
 */
function updateListView(filtered, containerId) {
    const container = document.getElementById(containerId);

    // 判断是否为H5端
    const isH5 = window.innerWidth <= 768;

    if (isH5) {
        // H5端：使用分组显示
        const selectedDay = currentFilters.day;
        container.innerHTML = renderGroupedActivitiesForH5(filtered, selectedDay);
        container.style.display = 'block';

        // 如果有选中日期，自动滚动到该日期组
        if (selectedDay !== null) {
            setTimeout(() => {
                const selectedGroup = container.querySelector(`.day-group-selected`);
                if (selectedGroup) {
                    selectedGroup.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    console.log('✅ 滚动到选中日期组');
                }
            }, 100);
        }
    } else {
        // PC端：保持原有网格布局
        const html = filtered.map(act => createScheduleItemHTML(act, false)).join('');
        container.innerHTML = `<div class="schedule-list">${html}</div>`;
        container.style.display = 'block';
    }
}
```

#### 1.3 修改日期切换函数

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

        // 🆕 H5端：自动滚动到该日期组
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                const dayGroup = document.querySelector(`.day-group[data-day="${day}"]`);
                if (dayGroup) {
                    // 平滑滚动到目标
                    dayGroup.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // 添加脉冲动画
                    dayGroup.style.animation = 'pulseHighlight 0.6s ease';
                    setTimeout(() => {
                        dayGroup.style.animation = '';
                    }, 600);

                    console.log('✅ 已滚动并高亮日期组:', dayNames[day]);
                }
            }, 100);
        }
    }

    // 更新视图
    updateViews();
}
```

#### 1.4 添加CSS样式

```css
/* ========== H5日期分组样式 ========== */

/* 日期分组容器 */
.day-group {
    margin-bottom: 16px;
    border-radius: 12px;
    background: #f8f9fa;
    overflow: hidden;
    transition: all 0.3s ease;
}

/* 选中的日期组 - 固定在顶部 + 高亮 */
.day-group-selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    position: sticky;
    top: 120px; /* 根据实际header高度调整 */
    z-index: 100;
    margin-bottom: 20px;
}

/* 日期组头部 */
.day-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-left: 4px solid #667eea;
    font-weight: 600;
}

.day-group-selected .day-group-header {
    background: rgba(255, 255, 255, 0.95);
    color: #667eea;
    border-left-color: #ffd700;
}

.day-group-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.day-icon {
    font-size: 18px;
}

.day-name {
    font-size: 15px;
    font-weight: 600;
}

.selected-badge {
    background: #ffd700;
    color: #333;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
}

.day-count {
    font-size: 13px;
    color: #666;
}

.day-group-selected .day-count {
    color: #667eea;
    font-weight: 600;
}

/* 日期组活动列表 */
.day-group-activities {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* 高亮活动卡片 */
.activity-highlight {
    background: #fff !important;
    border: 2px solid #ffd700 !important;
    box-shadow: 0 2px 12px rgba(255, 215, 0, 0.3) !important;
    animation: slideInFromTop 0.3s ease;
}

@keyframes slideInFromTop {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 选中日期组的脉冲动画 */
@keyframes pulseHighlight {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }
    50% {
        transform: scale(1.02);
        box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
    }
}

/* 移动端优化 */
@media (max-width: 768px) {
    .day-group {
        margin: 0 -8px 16px -8px;
        border-radius: 12px;
    }

    .day-group-selected {
        top: 120px; /* 根据实际header高度调整 */
        margin: 0 -8px 20px -8px;
    }

    .day-group-header {
        padding: 10px 12px;
    }

    .day-group-activities {
        padding: 8px;
    }

    .schedule-item {
        margin-bottom: 0;
    }
}
```

---

### 方案2: 修复筛选弹窗分类（基于当前Tab）

#### 2.1 创建Tab-specific分类配置

```javascript
/**
 * Tab与分类的映射配置
 * 每个Tab有自己独立的分类列表
 */
const TAB_CATEGORIES = {
    0: { // 兴趣班Tab
        name: '兴趣班',
        categories: ['舞蹈', '绘画', '武术', '音乐', '手工', '语言', '运动', '科技'],
        categoryField: 'category' // 从activity.category读取
    },
    1: { // 市集Tab
        name: '市集',
        categories: ['周末市集', '夜市', '农夫市集', '手作市集'],
        categoryField: 'category'
    },
    2: { // 音乐Tab
        name: '音乐',
        categories: ['演出', '工作坊', '大师班', '现场表演'],
        categoryField: 'category'
    },
    3: { // 灵活时间Tab
        name: '灵活时间',
        categories: ['随时可去', '需预约', '长期开放'],
        categoryField: 'flexibleTime' // 从activity.flexibleTime读取
    },
    4: { // 活动网站Tab
        name: '活动网站',
        categories: [], // 这个Tab可能不需要分类
        categoryField: 'source'
    }
};

/**
 * 获取当前Tab的分类列表
 * @param {Number} tabId - Tab ID
 * @param {Array} activities - 活动数组（用于动态提取分类）
 * @returns {Array} 分类数组
 */
function getCategoriesForTab(tabId, activities = allActivities) {
    const tabConfig = TAB_CATEGORIES[tabId];
    if (!tabConfig) {
        console.warn('⚠️ 未找到Tab配置:', tabId);
        return ['全部'];
    }

    console.log(`📋 获取Tab ${tabId}(${tabConfig.name})的分类`);

    // 方式1: 使用配置的固定分类
    if (tabConfig.categories.length > 0) {
        console.log('  使用配置分类:', tabConfig.categories);
        return ['全部', ...tabConfig.categories];
    }

    // 方式2: 从活动数据中动态提取分类
    const field = tabConfig.categoryField;
    const extractedCategories = [...new Set(
        activities
            .map(act => act[field])
            .filter(cat => cat && cat !== '灵活时间' && cat !== '是')
    )];

    console.log(`  从${field}字段提取分类:`, extractedCategories);
    return ['全部', ...extractedCategories];
}
```

#### 2.2 修改筛选弹窗更新函数

```javascript
/**
 * 更新筛选弹窗中的分类选项（基于当前Tab）
 * @param {Number} tabId - 当前Tab ID
 */
function updateFilterSheetCategories(tabId) {
    console.log('🔄 更新筛选弹窗分类，Tab:', tabId);

    // 1. 获取当前Tab的分类列表
    const categories = getCategoriesForTab(tabId);
    console.log('  分类列表:', categories);

    // 2. 更新DOM
    const container = document.getElementById('categoryOptions');
    if (!container) {
        console.error('❌ 找不到categoryOptions容器');
        return;
    }

    // 3. 生成HTML
    let html = '';
    categories.forEach((cat, index) => {
        const isSelected = index === 0; // 默认选中"全部"
        const selectedClass = isSelected ? 'selected' : '';
        const value = index === 0 ? 'all' : cat;

        html += `
            <div class="filter-option-item ${selectedClass}"
                 data-value="${value}"
                 onclick="selectFilterOption(this, 'category')">
                ${cat}
            </div>
        `;
    });

    container.innerHTML = html;
    console.log('✅ 筛选弹窗分类已更新');
}
```

#### 2.3 修改Tab切换函数

```javascript
function switchTab(index) {
    console.log('🔄 切换Tab:', index, `(${TAB_CATEGORIES[index].name})`);

    currentTab = index;

    // 切换Tab时清除所有筛选条件（除了搜索）
    currentFilters.category = '全部';
    currentFilters.price = '全部';
    currentFilters.day = null;
    currentFilters.search = '';

    // 清除搜索框
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    // 移除所有 active 类
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // 添加 active 类到选中的Tab
    document.querySelectorAll('.tab-item')[index].classList.add('active');
    document.querySelectorAll('.tab-pane')[index].classList.add('active');

    // 🆕 更新筛选弹窗的分类选项（基于新Tab）
    if (window.innerWidth <= 768) {
        updateFilterSheetCategories(index);
        console.log('✅ 已更新筛选弹窗分类');
    }

    // 更新视图
    updateViews();
}
```

#### 2.4 修改筛选选择函数

```javascript
/**
 * 选择筛选选项（支持动态分类）
 */
function selectFilterOption(element, type) {
    console.log('🎯 选择筛选选项:', type, element.dataset.value);

    // 移除同组的selected状态
    const siblings = element.parentElement.querySelectorAll('.filter-option-item');
    siblings.forEach(sib => sib.classList.remove('selected'));

    // 添加selected状态
    element.classList.add('selected');

    // 更新筛选状态（临时存储，点击确认后才应用）
    const value = element.dataset.value;

    if (type === 'category') {
        // 🆕 支持动态分类
        tempFilters.category = value === 'all' ? '全部' : value;
        console.log('  临时分类筛选:', tempFilters.category);
    } else if (type === 'price') {
        tempFilters.price = value;
        console.log('  临时价格筛选:', tempFilters.price);
    }

    // 更新筛选计数
    updateFilterCount();
}

/**
 * 应用筛选（从临时筛选到正式筛选）
 */
function applyFilters() {
    console.log('✅ 应用筛选:', tempFilters);

    // 将临时筛选复制到正式筛选
    currentFilters.category = tempFilters.category;
    currentFilters.price = tempFilters.price;

    // 更新视图
    updateViews();

    // 关闭弹窗
    closeFilterSheet();

    // 显示提示
    showToast(`已应用筛选`, 'success');
}
```

---

### 方案3: 初始化时更新分类

```javascript
/**
 * 初始化筛选弹窗（页面加载时调用）
 */
function initFilterSheet() {
    // 根据当前Tab初始化分类
    updateFilterSheetCategories(currentTab);

    // 初始化临时筛选状态
    tempFilters = {
        category: '全部',
        price: '全部'
    };

    console.log('✅ 筛选弹窗初始化完成，Tab:', currentTab);
}

// 在DOMContentLoaded中调用
document.addEventListener('DOMContentLoaded', function() {
    // ... 其他初始化代码 ...

    // 初始化筛选弹窗（仅在H5端）
    if (window.innerWidth <= 768) {
        initFilterSheet();
    }
});
```

---

## 📊 实现效果对比

### 修改前

```
H5筛选弹窗:
┌─────────────────────┐
│  筛选条件           │
├─────────────────────┤
│ 分类:               │
│ [全部] [兴趣班] ❌   │ ← 错误！这是Tab名称
│ [市集]   ❌         │
├─────────────────────┤
│ 价格:               │
│ [全部] [免费]       │
│ [<500]  [<1000]     │
└─────────────────────┘

H5活动列表（点击周一后）:
┌─────────────────────┐
│  ← 返回  周一活动   │
│  • 活动A            │
│  • 活动B            │
│  (其他天被隐藏)     │
└─────────────────────┘
```

### 修改后

```
H5筛选弹窗（兴趣班Tab）:
┌─────────────────────┐
│  筛选条件           │
├─────────────────────┤
│ 分类:               │
│ [全部] [舞蹈] ✅    │ ← 正确！子分类
│ [绘画]  [武术] ✅   │
│ [音乐]  [手工] ✅   │
├─────────────────────┤
│ 价格:               │
│ [全部] [免费]       │
└─────────────────────┘

H5筛选弹窗（市集Tab）:
┌─────────────────────┐
│  筛选条件           │
├─────────────────────┤
│ 分类:               │
│ [全部] [周末市集] ✅│ ← 自动更新为市集分类
│ [夜市]  [农夫市集] ✅│
├─────────────────────┤
│ 价格:               │
│ [全部] [免费]       │
└─────────────────────┘

H5活动列表（点击周一后）:
┌─────────────────────┐
│  📅 周一 (2个) ⭐   │ ← sticky固定
│  ⭐ • 活动A         │
│  ⭐ • 活动B         │
├─────────────────────┤
│  📅 周二 (1个)      │ ← 所有活动都可见
│    • 活动C          │
├─────────────────────┤
│  📅 周三 (3个)      │
│    • 活动D          │
│    • 活动E          │
└─────────────────────┘
```

---

## 🔧 修改步骤清单

### 步骤1: 实现H5分组显示
- [ ] 创建 `renderGroupedActivitiesForH5` 函数
- [ ] 创建 `createScheduleItemHTML` 函数
- [ ] 修改 `updateListView` 函数（支持H5分组）
- [ ] 修改 `toggleDayFilter` 函数（添加滚动）
- [ ] 添加CSS样式（`.day-group`, `.day-group-selected`）

### 步骤2: 修复筛选弹窗分类
- [ ] 创建 `TAB_CATEGORIES` 配置
- [ ] 创建 `getCategoriesForTab` 函数
- [ ] 创建 `updateFilterSheetCategories` 函数
- [ ] 修改 `switchTab` 函数（调用updateFilterSheetCategories）
- [ ] 修改 `selectFilterOption` 函数（支持动态分类）
- [ ] 创建 `initFilterSheet` 初始化函数

### 步骤3: 测试验证
- [ ] H5端测试分组显示
- [ ] 测试日期切换自动滚动
- [ ] 测试筛选弹窗分类切换
- [ ] 测试Tab切换后分类更新
- [ ] 测试筛选功能正常工作

---

## 📁 需要修改的文件

### `/Users/yuzhoudeshengyin/Documents/my_project/Chiengmai/public/index.html`

**需要添加的函数**:
1. `renderGroupedActivitiesForH5(activities, selectedDay)` - H5分组渲染
2. `createScheduleItemHTML(act, isHighlighted)` - 活动卡片HTML
3. `getDayIcon(day)` - 日期图标
4. `getCategoriesForTab(tabId, activities)` - 获取Tab分类
5. `updateFilterSheetCategories(tabId)` - 更新筛选弹窗
6. `initFilterSheet()` - 初始化筛选弹窗

**需要修改的函数**:
1. `updateListView(filtered, containerId)` - 支持H5分组
2. `toggleDayFilter(day)` - 添加自动滚动
3. `switchTab(index)` - 调用updateFilterSheetCategories
4. `selectFilterOption(element, type)` - 支持动态分类

**需要添加的CSS**:
1. `.day-group` - 日期组容器
2. `.day-group-selected` - 选中的日期组（sticky）
3. `.day-group-header` - 日期组头部
4. `.day-group-activities` - 活动列表
5. `.activity-highlight` - 高亮活动卡片
6. `@keyframes slideInFromTop` - 滑入动画
7. `@keyframes pulseHighlight` - 脉冲动画

**需要添加的变量**:
1. `TAB_CATEGORIES` - Tab分类配置
2. `tempFilters` - 临时筛选状态

---

## ✅ 验收标准

### 需求1: H5分组显示
- ✅ 点击日期后，显示所有天的活动（不隐藏）
- ✅ 选中的日期组固定在顶部（sticky定位）
- ✅ 选中的日期组有特殊高亮样式
- ✅ 点击不同日期时，自动滚动到该日期组
- ✅ 选中日期组有脉冲动画反馈

### 需求2: 筛选弹窗分类正确
- ✅ H5端筛选弹窗中不显示"兴趣班"、"市集"等Tab名称
- ✅ 显示的应该是子分类（如"舞蹈"、"绘画"）
- ✅ 不同Tab显示不同的分类列表

### 需求3: Tab切换更新分类
- ✅ 切换Tab时，筛选弹窗的分类自动更新
- ✅ 切换后筛选功能正常工作
- ✅ 筛选状态在Tab切换时正确重置

---

## 🎯 关键技术点

### 1. Sticky定位
```css
.day-group-selected {
    position: sticky;
    top: 120px; /* 根据header高度调整 */
    z-index: 100;
}
```

### 2. 动态分类提取
```javascript
// 从当前Tab的活动中提取分类
const categories = [...new Set(
    activities
        .filter(act => /* 符合当前Tab */)
        .map(act => act.category)
)];
```

### 3. Tab切换时更新DOM
```javascript
function switchTab(index) {
    currentTab = index;
    // 更新筛选弹窗
    updateFilterSheetCategories(index);
    // 更新视图
    updateViews();
}
```

### 4. 平滑滚动到指定元素
```javascript
element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
});
```

---

## 📝 注意事项

1. **兼容性**: Sticky定位在iOS 12.2+、Android 5+支持良好
2. **性能**: 大量活动时考虑虚拟滚动（当前数据量不需要）
3. **触摸**: 确保所有触摸目标≥44px（已修复）
4. **动画**: 使用transform和opacity实现流畅动画
5. **调试**: 使用console.log跟踪状态变化

---

**创建时间**: 2026-01-29
**文档状态**: ✅ 已完成详细分析和方案设计
**下一步**: 开始实现代码修改
