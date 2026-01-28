#!/usr/bin/env node

/**
 * 分类筛选自动化测试
 * 测试分类筛选功能的完整性
 */

const fs = require('fs');
const path = require('path');

console.log('🏷️  开始测试分类筛选功能...\n');

const indexPath = path.join(__dirname, 'public', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

let passed = 0;
let failed = 0;

const tests = [
    {
        name: '1. 分类筛选器初始化函数存在',
        test: () => {
            const hasFunction = html.includes('function initCategoryFilters') ||
                              html.includes('const initCategoryFilters');
            console.log(`   函数存在: ${hasFunction}`);
            return hasFunction;
        }
    },
    {
        name: '2. 分类筛选器排除市集',
        test: () => {
            const excludesMarket = html.includes("cat !== '市集'");
            console.log(`   排除市集: ${excludesMarket}`);
            return excludesMarket;
        }
    },
    {
        name: '3. 分类筛选器排除音乐',
        test: () => {
            const excludesMusic = html.includes("cat !== '音乐'");
            console.log(`   排除音乐: ${excludesMusic}`);
            return excludesMusic;
        }
    },
    {
        name: '4. 分类按钮点击处理',
        test: () => {
            const hasClickHandler = html.includes("setFilter('category'") ||
                                   html.includes('onclick="setFilter');
            console.log(`   点击处理: ${hasClickHandler}`);
            return hasClickHandler;
        }
    },
    {
        name: '5. 筛选器容器存在',
        test: () => {
            const hasContainer = html.includes('id="categoryChips"');
            console.log(`   容器存在: ${hasContainer}`);
            return hasContainer;
        }
    },
    {
        name: '6. 分类筛选逻辑存在',
        test: () => {
            const hasFilterLogic = html.includes('function setFilter') ||
                                  html.includes('function filterActivities');
            console.log(`   筛选逻辑: ${hasFilterLogic}`);
            return hasFilterLogic;
        }
    },
    {
        name: '7. 活动数据包含分类字段',
        test: () => {
            const hasCategoryField = html.includes('a.category') ||
                                    html.includes('.category');
            console.log(`   分类字段: ${hasCategoryField}`);
            return hasCategoryField;
        }
    },
    {
        name: '8. 支持显示所有分类',
        test: () => {
            const hasAllOption = html.includes('全部') ||
                               html.includes('setFilter(\'category\', \'全部\')');
            console.log(`   全部分类选项: ${hasAllOption}`);
            return hasAllOption;
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
    console.log('\n🎉 分类筛选功能测试全部通过！');
    process.exit(0);
} else {
    console.log(`\n⚠️  有 ${failed} 个测试失败，请检查。`);
    process.exit(1);
}
