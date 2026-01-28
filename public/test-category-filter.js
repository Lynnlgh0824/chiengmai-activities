// 分类筛选诊断工具

// 模拟数据加载
const data = require('../data/items.json');

console.log('=== 分类筛选诊断 ===\n');

// 1. 检查所有分类
const categories = [...new Set(data.map(item => item.category))];
console.log('1. 所有分类:', categories);
console.log('   分类数量:', categories.length);

// 2. 检查数据完整性
const itemsWithoutCategory = data.filter(item => !item.category);
console.log('\n2. 缺少分类的活动:', itemsWithoutCategory.length);

// 3. 测试筛选逻辑
function filterActivities(activities, category) {
    if (category === '全部') {
        return activities;
    }
    return activities.filter(act => act.category === category);
}

// 测试每个分类
console.log('\n3. 测试每个分类的筛选结果:');
categories.forEach(cat => {
    const filtered = filterActivities(data, cat);
    console.log(`   ${cat}: ${filtered.length} 个活动`);
});

// 4. 检查 categoryColors
const categoryColors = {
    '瑜伽': '#FF6B6B',
    '冥想': '#4ECDC4',
    '户外探险': '#FFE66D',
    '文化艺术': '#95E1D3',
    '美食体验': '#F38181',
    '节庆活动': '#AA96DA',
    '其他': '#A8D8EA'
};

console.log('\n4. categoryColors 定义:');
console.log('   已定义:', Object.keys(categoryColors));
console.log('   实际分类:', categories);

// 找出未定义颜色的分类
const undefinedColors = categories.filter(cat => !categoryColors[cat]);
if (undefinedColors.length > 0) {
    console.log('   ⚠️  未定义颜色的分类:', undefinedColors);
} else {
    console.log('   ✅ 所有分类都有颜色定义');
}

// 5. 生成 HTML
console.log('\n5. 生成的分类按钮 HTML:');
let html = '<div class="filter-chip active" onclick="setFilter(\'category\', \'全部\')">全部</div>';
categories.forEach(cat => {
    html += `<div class="filter-chip" onclick="setFilter('category', '${cat}')">${cat}</div>`;
});
console.log(html);

console.log('\n=== 诊断完成 ===');
