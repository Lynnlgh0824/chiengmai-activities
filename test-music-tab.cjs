#!/usr/bin/env node

/**
 * 音乐Tab功能测试脚本
 * 测试新增的音乐tab是否正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🎵 开始测试音乐Tab功能...\n');

// 读取index.html文件
const indexPath = path.join(__dirname, 'public', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

// 测试项目
const tests = [
    {
        name: '1. 检查Tab数量（应该是6个）',
        test: () => {
            // 匹配 class="tab-item" 或 class="tab-item active"
            const tabMatches = html.match(/<div class="tab-item[^"]*" onclick="switchTab\(\d+\)">/g);
            const tabCount = tabMatches ? tabMatches.length : 0;
            console.log(`   发现 ${tabCount} 个Tab`);
            return tabCount === 6;
        }
    },
    {
        name: '2. 检查音乐Tab是否存在',
        test: () => {
            const hasMusicTab = html.includes('onclick="switchTab(2)"') &&
                               html.includes('音乐</span>');
            console.log(`   音乐Tab存在: ${hasMusicTab}`);
            return hasMusicTab;
        }
    },
    {
        name: '3. 检查音乐Tab的图标',
        test: () => {
            const hasMusicIcon = html.includes('🎵</span>') &&
                                html.includes('音乐</span>');
            console.log(`   音乐图标正确: ${hasMusicIcon}`);
            return hasMusicIcon;
        }
    },
    {
        name: '4. 检查音乐Tab内容区域',
        test: () => {
            const hasMusicPane = html.includes('id="tab-2"') &&
                                html.includes('id="calendarGridMusic"') &&
                                html.includes('id="dateGridHeaderMusic"');
            console.log(`   音乐Tab内容区存在: ${hasMusicPane}`);
            return hasMusicPane;
        }
    },
    {
        name: '5. 检查updateViews是否支持音乐Tab（case 2）',
        test: () => {
            const hasMusicCase = html.includes('case 2: // 音乐') ||
                                html.includes('case 2: // 音乐');
            console.log(`   updateViews支持音乐Tab: ${hasMusicCase}`);
            return hasMusicCase;
        }
    },
    {
        name: '6. 检查filterActivities是否支持音乐Tab（case 2）',
        test: () => {
            const hasMusicFilter = html.includes("case 2: // 音乐") &&
                                   html.includes("a.category === '音乐'");
            console.log(`   filterActivities支持音乐Tab: ${hasMusicFilter}`);
            return hasMusicFilter;
        }
    },
    {
        name: '7. 检查分类筛选器是否排除音乐',
        test: () => {
            const excludesMusic = html.includes("filter(cat => cat !== '市集' && cat !== '音乐')");
            console.log(`   分类筛选器排除音乐: ${excludesMusic}`);
            return excludesMusic;
        }
    },
    {
        name: '8. 检查兴趣班是否排除音乐',
        test: () => {
            const excludesMusicFromInterest = html.includes("// 排除音乐") &&
                                              html.includes("if (a.category === '音乐') return false");
            console.log(`   兴趣班排除音乐: ${excludesMusicFromInterest}`);
            return excludesMusicFromInterest;
        }
    },
    {
        name: '9. 检查Tab索引是否正确更新',
        test: () => {
            // 灵活时间活动应该是Tab 3
            const flexibleIsTab3 = html.includes('case 3: // 灵活时间活动');
            // 活动网站应该是Tab 4
            const websiteIsTab4 = html.includes('case 4: // 活动网站');
            // 攻略信息应该是Tab 5
            const guideIsTab5 = html.includes('case 5: // 攻略信息');

            console.log(`   灵活时间活动Tab 3: ${flexibleIsTab3}`);
            console.log(`   活动网站Tab 4: ${websiteIsTab4}`);
            console.log(`   攻略信息Tab 5: ${guideIsTab5}`);
            return flexibleIsTab3 && websiteIsTab4 && guideIsTab5;
        }
    },
    {
        name: '10. 检查updateCalendarView是否支持音乐Tab',
        test: () => {
            const supportsMusic = html.includes("gridId = 'calendarGridMusic'") &&
                                  html.includes("headerId = 'dateGridHeaderMusic'");
            console.log(`   updateCalendarView支持音乐Tab: ${supportsMusic}`);
            return supportsMusic;
        }
    },
    {
        name: '11. 检查Tab数量统计是否包含音乐',
        test: () => {
            const hasMusicStats = html.includes('console.log(\'  - 音乐:\', musicActivities.length);');
            console.log(`   Tab数量统计包含音乐: ${hasMusicStats}`);
            return hasMusicStats;
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
    console.log('\n🎉 所有测试通过！音乐Tab功能正常！');
    process.exit(0);
} else {
    console.log(`\n⚠️  有 ${failed} 个测试失败，请检查。`);
    process.exit(1);
}
