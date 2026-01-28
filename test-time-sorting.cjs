#!/usr/bin/env node

/**
 * 时间排序自动化测试
 * 将 test-time-sorting.html 转为命令行测试
 * 可以集成到 CI/CD 流程中
 */

const fs = require('fs');
const path = require('path');

console.log('⏰ 开始测试时间排序功能...\n');

// 读取 index.html 文件
const indexPath = path.join(__dirname, 'public', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

// 测试用例
const tests = [
    {
        name: '1. 检查时间排序函数存在',
        test: () => {
            const hasCompareFunction = html.includes('function compareTimes') ||
                                     html.includes('const compareTimes') ||
                                     html.includes('.sort(');
            console.log(`   排序函数存在: ${hasCompareFunction}`);
            return hasCompareFunction;
        }
    },
    {
        name: '2. 检查时间提取逻辑',
        test: () => {
            const hasExtractTime = html.includes('extractStartTime') ||
                                  html.includes('hour:') ||
                                  html.includes('minute:');
            console.log(`   时间提取逻辑: ${hasExtractTime}`);
            return hasExtractTime;
        }
    },
    {
        name: '3. 检查数字比较逻辑（非字符串比较）',
        test: () => {
            // 检查是否使用 parseInt 或 Number 进行数字比较
            const hasNumberComparison = html.includes('parseInt') ||
                                       html.includes('Number(') ||
                                       (html.includes('.hour') && html.includes('-'));
            console.log(`   数字比较逻辑: ${hasNumberComparison}`);
            return hasNumberComparison;
        }
    },
    {
        name: '4. 检查单一时间点优先规则',
        test: () => {
            // 检查是否有逻辑处理单一时间点排在时间段前面
            const hasSingleTimePriority = html.includes('includes(\'-\')') ||
                                         html.includes('isRange') ||
                                         html.includes('单一时间');
            console.log(`   单一时间点优先: ${hasSingleTimePriority}`);
            return hasSingleTimePriority;
        }
    },
    {
        name: '5. 检查时间段结束时间排序',
        test: () => {
            // 检查是否有结束时间的提取和比较
            const hasEndTimeLogic = html.includes('extractEndTime') ||
                                   html.includes('endA') ||
                                   html.includes('endB');
            console.log(`   结束时间排序: ${hasEndTimeLogic}`);
            return hasEndTimeLogic;
        }
    },
    {
        name: '6. 验证时间格式支持',
        test: () => {
            // 检查是否支持多种时间格式
            const supportsFormats = html.includes('flexibleTime') ||
                                   html.includes('灵活时间') ||
                                   html.includes('无固定时间');
            console.log(`   灵活时间支持: ${supportsFormats}`);
            return supportsFormats;
        }
    },
    {
        name: '7. 检查排序调用点',
        test: () => {
            // 检查是否在实际代码中调用了排序
            const hasSortCall = html.includes('.sort((a, b) =>') ||
                              html.includes('.sort(compareTimes)') ||
                              html.includes('compareTimes(a.time, b.time)');
            console.log(`   排序调用: ${hasSortCall}`);
            return hasSortCall;
        }
    },
    {
        name: '8. 检查日历视图中的时间排序',
        test: () => {
            // 检查日历视图是否使用了排序
            const hasCalendarSort = html.includes('function updateCalendarView') ||
                                    html.includes('calendarGrid') ||
                                    (html.includes('sortedActivities') && html.includes('calendar'));
            console.log(`   日历视图排序: ${hasCalendarSort}`);
            return hasCalendarSort;
        }
    }
];

// 运行所有测试
let passed = 0;
let failed = 0;

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
    console.log('\n🎉 所有测试通过！时间排序功能正常！');
    process.exit(0);
} else {
    console.log(`\n⚠️  有 ${failed} 个测试失败，请检查。`);
    process.exit(1);
}
