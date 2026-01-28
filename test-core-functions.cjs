#!/usr/bin/env node

/**
 * 核心功能自动化测试
 * 测试应用的核心功能完整性
 */

const fs = require('fs');
const path = require('path');

console.log('⚙️  开始测试核心功能...\n');

const indexPath = path.join(__dirname, 'public', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

let passed = 0;
let failed = 0;

const tests = [
    // Tab 功能
    {
        name: '1. Tab切换函数存在',
        test: () => {
            const hasFunction = html.includes('function switchTab');
            console.log(`   switchTab函数: ${hasFunction}`);
            return hasFunction;
        }
    },
    {
        name: '2. 6个Tab全部存在',
        test: () => {
            const tabMatches = html.match(/switchTab\(\d\)/g);
            const tabCount = tabMatches ? tabMatches.length : 0;
            console.log(`   Tab数量: ${tabCount}`);
            return tabCount === 6;
        }
    },
    // 筛选功能
    {
        name: '3. 活动筛选函数存在',
        test: () => {
            const hasFilter = html.includes('function filterActivities');
            console.log(`   filterActivities函数: ${hasFilter}`);
            return hasFilter;
        }
    },
    {
        name: '4. 筛选器设置函数存在',
        test: () => {
            const hasSetFilter = html.includes('function setFilter');
            console.log(`   setFilter函数: ${hasSetFilter}`);
            return hasSetFilter;
        }
    },
    // 日历视图
    {
        name: '5. 日历视图更新函数存在',
        test: () => {
            const hasUpdateCalendar = html.includes('function updateCalendarView');
            console.log(`   updateCalendarView函数: ${hasUpdateCalendar}`);
            return hasUpdateCalendar;
        }
    },
    {
        name: '6. 日期网格容器存在',
        test: () => {
            const hasCalendarGrid = html.includes('id="calendarGrid"') ||
                                  html.includes('class="calendar-grid"');
            console.log(`   日期网格: ${hasCalendarGrid}`);
            return hasCalendarGrid;
        }
    },
    // 数据加载
    {
        name: '7. 数据加载逻辑存在',
        test: () => {
            const hasDataLoad = html.includes('fetchActivities') ||
                              html.includes('allActivities') ||
                              html.includes('loadActivities');
            console.log(`   数据加载: ${hasDataLoad}`);
            return hasDataLoad;
        }
    },
    {
        name: '8. 活动卡片渲染逻辑存在',
        test: () => {
            const hasRender = html.includes('renderActivities') ||
                            html.includes('createActivityCard') ||
                            html.includes('displayActivities') ||
                            html.includes('innerHTML') ||
                            html.includes('createElement');
            console.log(`   渲染逻辑: ${hasRender}`);
            return hasRender;
        }
    },
    // Tab内容区域
    {
        name: '9. 所有Tab内容区域存在',
        test: () => {
            const tabPanes = html.match(/id="tab-\d"/g);
            const tabPaneCount = tabPanes ? tabPanes.length : 0;
            console.log(`   Tab内容区域数量: ${tabPaneCount}`);
            return tabPaneCount >= 6;
        }
    },
    // 时间排序
    {
        name: '10. 时间排序逻辑存在',
        test: () => {
            const hasSort = html.includes('.sort(') ||
                          html.includes('compareTimes') ||
                          html.includes('sortActivities');
            console.log(`   排序逻辑: ${hasSort}`);
            return hasSort;
        }
    },
    // 状态管理
    {
        name: '11. 当前Tab状态变量存在',
        test: () => {
            const hasCurrentTab = html.includes('currentTab');
            console.log(`   currentTab变量: ${hasCurrentTab}`);
            return hasCurrentTab;
        }
    },
    {
        name: '12. 当前筛选条件变量存在',
        test: () => {
            const hasFilters = html.includes('currentFilters') ||
                             html.includes('currentFilters =');
            console.log(`   currentFilters变量: ${hasFilters}`);
            return hasFilters;
        }
    }
];

// 运行所有测试
tests.forEach(({ name, test }) => {
    try {
        const result = test();
        if (result) {
            console.log(`✅ ${name}\n`);
            passed++;
        } else {
            console.log(`❌ ${name}\n`);
            failed++;
        }
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   错误: ${error.message}\n`);
        failed++;
    }
});

// 输出总结
console.log('='.repeat(50));
console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
console.log('='.repeat(50));

if (failed === 0) {
    console.log('\n🎉 核心功能测试全部通过！');
    process.exit(0);
} else {
    console.log(`\n⚠️  有 ${failed} 个测试失败，请检查。`);
    process.exit(1);
}
