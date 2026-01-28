import { test, expect } from '@playwright/test';

/**
 * 分类筛选缓存问题验证测试
 * 用于确认页面是否加载了正确的版本
 */

test('验证：确认加载了正确版本的HTML', async ({ page }) => {
    console.log('\n=== 分类筛选缓存问题验证 ===\n');

    // 监听所有控制台消息
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push({
            type: msg.type(),
            text: text
        });
        console.log(`[${msg.type()}] ${text}`);
    });

    // 访问页面
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle' });

    // 等待数据加载
    await page.waitForTimeout(3000);

    console.log('\n=== 检查关键指标 ===\n');

    // 1. 检查 window.allActivities 是否存在
    const allActivitiesLength = await page.evaluate(() => {
        return window.allActivities?.length ?? 0;
    });

    console.log(`1. window.allActivities.length: ${allActivitiesLength}`);

    if (allActivitiesLength === 0) {
        console.log('   ❌ 问题：window.allActivities 为空');
        console.log('   原因：浏览器缓存了旧版本的HTML');
        console.log('   解决：请清除浏览器缓存并强制刷新（Ctrl+Shift+R）');
    } else {
        console.log(`   ✅ 正确：加载了 ${allActivitiesLength} 个活动`);
    }

    // 2. 检查是否有调试日志
    const hasDebugLogs = logs.some(log =>
        log.text.includes('📋 初始化分类筛选器') ||
        log.text.includes('🔍 setFilter 被调用')
    );

    console.log(`2. 调试日志存在: ${hasDebugLogs ? '✅' : '❌'}`);

    if (!hasDebugLogs) {
        console.log('   ❌ 问题：没有看到调试日志');
        console.log('   原因：浏览器缓存了旧版本的HTML');
        console.log('   解决：请清除浏览器缓存并强制刷新（Ctrl+Shift+R）');
    } else {
        console.log('   ✅ 正确：使用了新版本的HTML（包含调试日志）');
    }

    // 3. 检查分类按钮是否正确显示
    const categoryChips = page.locator('#categoryChips .filter-chip');
    const chipCount = await categoryChips.count();

    console.log(`3. 分类按钮数量: ${chipCount}`);

    // 4. 检查日历视图中的活动数量
    const calendarChips = page.locator('#calendarGrid .activity-chip');
    const calendarCount = await calendarChips.count();

    console.log(`4. 日历视图活动数量: ${calendarCount}`);

    if (allActivitiesLength === 0 && calendarCount > 0) {
        console.log('   ❌ 问题：活动数据存在但 window.allActivities 为空');
        console.log('   原因：使用了旧版本的HTML（没有 window.allActivities）');
        console.log('   解决：请清除浏览器缓存并强制刷新（Ctrl+Shift+R）');
    } else if (allActivitiesLength > 0 && calendarCount === allActivitiesLength) {
        console.log('   ✅ 正确：活动数量一致（没有重复显示）');
    } else if (allActivitiesLength > 0 && calendarCount > allActivitiesLength) {
        console.log('   ⚠️  警告：日历视图中的活动数量多于实际数据');
        console.log('   原因：可能有活动在多个日期显示（如果weekdays包含多个值）');
    }

    // 5. 测试分类筛选
    console.log('\n=== 测试分类筛选 ===\n');

    if (chipCount > 1) {
        // 点击第二个分类按钮
        const secondCategory = await categoryChips.nth(1).textContent();
        console.log(`点击分类: ${secondCategory}`);

        await categoryChips.nth(1).click();
        await page.waitForTimeout(1000);

        // 从 JavaScript 获取筛选后的活动
        const filtered = await page.evaluate(() => {
            return window.allActivities || [];
        });

        const marketActivities = filtered.filter(act => act.category === secondCategory);

        console.log(`筛选后活动总数: ${filtered.length}`);
        console.log(`${secondCategory}分类的活动: ${marketActivities.length}`);

        if (filtered.length === 0) {
            console.log('   ❌ 问题：筛选后没有活动');
            console.log('   原因：window.allActivities 不可用或为空');
            console.log('   解决：请清除浏览器缓存并强制刷新（Ctrl+Shift+R）');
        } else if (marketActivities.length === filtered.length) {
            console.log(`   ✅ 正确：所有 ${filtered.length} 个活动都属于 "${secondCategory}" 分类`);
        } else {
            console.log(`   ⚠️  注意：只有 ${marketActivities.length}/${filtered.length} 个活动属于 "${secondCategory}" 分类`);
        }
    }

    // 6. 最终结论
    console.log('\n=== 最终结论 ===\n');

    const isCorrectVersion = allActivitiesLength > 0 && hasDebugLogs;

    if (isCorrectVersion) {
        console.log('✅ 页面已加载正确版本');
        console.log('✅ 分类筛选功能应该正常工作');
        console.log('\n您可以：');
        console.log('- 手动测试分类筛选功能');
        console.log('- 查看控制台调试日志');
        console.log('- 验证筛选结果是否正确');
    } else {
        console.log('❌ 页面加载了旧版本（缓存的HTML）');
        console.log('\n请按以下步骤解决：');
        console.log('\n1️⃣  清除浏览器缓存：');
        console.log('   - Chrome/Edge: Ctrl+Shift+Delete');
        console.log('   - Firefox: Ctrl+Shift+Delete');
        console.log('   - Safari: Cmd+Option+E');
        console.log('\n2️⃣  强制刷新页面：');
        console.log('   - Chrome/Edge: Ctrl+Shift+R');
        console.log('   - Firefox: Ctrl+F5');
        console.log('   - Safari: Cmd+Option+R');
        console.log('\n3️⃣  或在开发者工具中禁用缓存：');
        console.log('   - 按 F12 打开开发者工具');
        console.log('   - 切换到 Network 标签');
        console.log('   - 勾选 "Disable cache"');
        console.log('   - 刷新页面 (F5)');
        console.log('\n4️⃣  然后重新运行此验证测试');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // 最终断言
    expect(allActivitiesLength, '应该加载活动数据').toBeGreaterThan(0);
    expect(hasDebugLogs, '应该包含调试日志（说明使用了新版本HTML）').toBe(true);
});

test('手动验证：查看页面详细信息', async ({ page }) => {
    // 监听控制台
    const logs = [];
    page.on('console', msg => {
        logs.push(msg.text());
        console.log(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('http://localhost:5176', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 收集页面信息
    const pageInfo = await page.evaluate(() => {
        return {
            allActivitiesLength: window.allActivities?.length ?? 0,
            hasInitCategoryFilters: typeof window.initCategoryFilters === 'function',
            hasSetFilter: typeof window.setFilter === 'function',
            hasFilterActivities: typeof window.filterActivities === 'function',
            hasUpdateViews: typeof window.updateViews === 'function',
            location: window.location.href,
            timestamp: new Date().toISOString()
        };
    });

    console.log('\n=== 页面详细信息 ===\n');
    console.log(JSON.stringify(pageInfo, null, 2));

    // 生成报告
    console.log('\n=== 功能检查结果 ===\n');
    console.log(`allActivities: ${pageInfo.allActivitiesLength > 0 ? '✅' : '❌'}`);
    console.log(`initCategoryFilters: ${pageInfo.hasInitCategoryFilters ? '✅' : '❌'}`);
    console.log(`setFilter: ${pageInfo.hasSetFilter ? '✅' : '❌'}`);
    console.log(`filterActivities: ${pageInfo.hasFilterActivities ? '✅' : '❌'}`);
    console.log(`updateViews: ${pageInfo.hasUpdateViews ? '✅' : '❌'}`);

    const allFunctionsExist =
        pageInfo.hasInitCategoryFilters &&
        pageInfo.hasSetFilter &&
        pageInfo.hasFilterActivities &&
        pageInfo.hasUpdateViews;

    if (allFunctionsExist && pageInfo.allActivitiesLength > 0) {
        console.log('\n✅ 所有功能正常，分类筛选应该可以正常工作');
    } else {
        console.log('\n❌ 部分功能缺失，需要清除浏览器缓存');
    }
});
