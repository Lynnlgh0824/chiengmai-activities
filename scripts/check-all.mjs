#!/usr/bin/env node

/**
 * 全面检查和自动化测试脚本
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔍 开始全面检查和自动化测试\n');
console.log('═'.repeat(60));

let allPassed = true;
const errors = [];

// ========== 1. 检查HTML文件 ==========
console.log('\n📄 1. 检查HTML文件');

try {
    const htmlPath = './public/index.html';
    const html = fs.readFileSync(htmlPath, 'utf8');

    // 检查1.1: 文件是否存在
    console.log('   ✅ HTML文件存在');

    // 检查1.2: 标题版本
    if (html.includes('v2.1') && html.includes('2026-01-26')) {
        console.log('   ✅ 页面标题版本正确');
    } else {
        console.log('   ❌ 页面标题版本未更新');
        allPassed = false;
    }

    // 检查1.3: Tab数量
    const tabMatches = html.match(/<div class="tab-item"/g);
    if (tabMatches && tabMatches.length === 4) {
        console.log(`   ✅ Tab数量正确: ${tabMatches.length}个`);
    } else {
        console.log(`   ❌ Tab数量错误: ${tabMatches?.length || 0}个，应该是4个`);
        allPassed = false;
        errors.push('Tab数量错误');
    }

    // 检查1.4: Tab名称
    const tabNames = ['兴趣班', '列表视图', '灵活时间活动', '市集视图'];
    let allTabsFound = true;
    tabNames.forEach(name => {
        if (!html.includes(name)) {
            console.log(`   ❌ 缺少Tab: ${name}`);
            allPassed = false;
            allTabsFound = false;
            errors.push(`缺少Tab: ${name}`);
        }
    });
    if (allTabsFound) {
        console.log('   ✅ 所有Tab名称正确');
    }

    // 检查1.5: tab-pane数量
    const tabPaneMatches = html.match(/<div id="tab-[0-9]" class="tab-pane"/g);
    if (tabPaneMatches && tabPaneMatches.length === 4) {
        console.log(`   ✅ tab-pane数量正确: ${tabPaneMatches.length}个`);
    } else {
        console.log(`   ❌ tab-pane数量错误: ${tabPaneMatches?.length || 0}个，应该是4个`);
        allPassed = false;
        errors.push('tab-pane数量错误');
    }

    // 检查1.6: 检查关键函数是否存在
    const requiredFunctions = [
        'updateCalendarView',
        'updateListView',
        'updateFlexibleTimeView',
        'updateMarketView',
        'createMarketDayCell',
        'isSpecificTimeFormat'
    ];

    let allFunctionsFound = true;
    requiredFunctions.forEach(func => {
        if (!html.includes(`function ${func}`)) {
            console.log(`   ❌ 缺少函数: ${func}`);
            allPassed = false;
            allFunctionsFound = false;
            errors.push(`缺少函数: ${func}`);
        }
    });
    if (allFunctionsFound) {
        console.log(`   ✅ 所有关键函数存在: ${requiredFunctions.length}个`);
    }

} catch (error) {
    console.log('   ❌ HTML文件检查失败:', error.message);
    allPassed = false;
    errors.push('HTML文件检查失败');
}

// ========== 2. 检查数据文件 ==========
console.log('\n📊 2. 检查数据文件');

try {
    const data = JSON.parse(fs.readFileSync('./data/items.json', 'utf8'));
    console.log(`   ✅ 活动总数: ${data.length}个`);

    // 检查2.1: 市集活动数量
    const markets = data.filter(item => item.category === '市集');
    console.log(`   ✅ 市集活动: ${markets.length}个`);

    // 检查2.2: 灵活时间活动数量
    function isSpecificTimeFormat(time) {
        if (!time || typeof time !== 'string') return false;
        const timePattern = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}/;
        return timePattern.test(time);
    }

    const flexibleActivities = data.filter(item => {
        const time = item.time || '';
        return !isSpecificTimeFormat(time);
    });
    console.log(`   ✅ 灵活时间活动: ${flexibleActivities.length}个`);

    // 检查2.3: 有具体时间的活动数量
    const specificTimeActivities = data.filter(item => {
        const time = item.time || '';
        return isSpecificTimeFormat(time) && item.category !== '市集';
    });
    console.log(`   ✅ 有具体时间的非市集活动: ${specificTimeActivities.length}个`);

} catch (error) {
    console.log('   ❌ 数据文件检查失败:', error.message);
    allPassed = false;
    errors.push('数据文件检查失败');
}

// ========== 3. 检查服务器配置 ==========
console.log('\n⚙️  3. 检查服务器配置');

try {
    // 检查后端服务器
    try {
        execSync('curl -s http://localhost:3000/api/health', { timeout: 2000 });
        console.log('   ✅ 后端服务器运行正常 (port 3000)');
    } catch (error) {
        console.log('   ❌ 后端服务器未运行');
        allPassed = false;
        errors.push('后端服务器未运行');
    }

} catch (error) {
    console.log('   ⚠️  服务器检查跳过:', error.message);
}

// ========== 4. 生成检查报告 ==========
console.log('\n' + '═'.repeat(60));
console.log('📋 检查报告\n');

if (allPassed) {
    console.log('✅ 所有检查通过！');
    console.log('\n📋 预期Tab配置:');
    console.log('   Tab 1: 📅 兴趣班 - 有具体时间的非市集活动');
    console.log('   Tab 2: 📋 列表视图 - 仅灵活时间活动');
    console.log('   Tab 3: ⏰ 灵活时间活动 - 仅灵活时间活动');
    console.log('   Tab 4: 🏪 市集视图 - 仅市集活动');
    console.log('\n🔄 下一步操作:');
    console.log('   1. 重启开发服务器: npm run dev');
    console.log('   2. 访问: http://localhost:5173/');
    console.log('   3. 强制刷新: Cmd+Shift+R (Mac) 或 Ctrl+Shift+F5 (Windows)');
} else {
    console.log('❌ 发现问题:');
    errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  请修复以上问题后重新测试');
    process.exit(1);
}

console.log('\n' + '═'.repeat(60));
console.log('✨ 检查完成！');
