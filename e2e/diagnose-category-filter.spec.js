import { test, expect } from '@playwright/test';

/**
 * 分类筛选问题诊断测试
 * 用于找出为什么显示 73 个活动而不是 35 个
 */

test('诊断：检查实际加载的活动数量', async ({ page }) => {
    await page.goto('http://localhost:5176');
    await page.waitForSelector('#categoryChips', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // 检查控制台日志
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        console.log('浏览器控制台:', text);
    });

    // 等待一段时间收集所有日志
    await page.waitForTimeout(3000);

    // 查找关键日志
    const loadLog = logs.find(log => log.includes('已加载'));
    console.log('数据加载日志:', loadLog);

    // 检查日历视图中的活动数量
    const calendarChips = page.locator('#calendarGrid .activity-chip');
    const calendarCount = await calendarChips.count();
    console.log('日历视图中的活动数量:', calendarCount);

    // 检查列表视图中的活动数量
    const listItems = page.locator('.schedule-item');
    const listCount = await listItems.count();
    console.log('列表视图中的活动数量:', listCount);

    // 获取所有活动的标题（检查是否有重复）
    const titles = await calendarChips.allTextContents();
    console.log('活动标题:', titles);
    console.log('唯一标题数量:', new Set(titles).size);

    // 检查是否有重复的活动ID
    const activityIds = new Set();
    const duplicates = [];

    for (const chip of await calendarChips.all()) {
        const clickAttr = await chip.getAttribute('onclick');
        const match = clickAttr?.match(/showActivityDetail\((\d+)\)/);
        if (match) {
            const id = match[1];
            if (activityIds.has(id)) {
                duplicates.push(id);
            }
            activityIds.add(id);
        }
    }

    console.log('唯一活动ID数量:', activityIds.size);
    console.log('重复的活动ID:', duplicates);

    // 直接从页面JavaScript获取数据
    const allActivitiesCount = await page.evaluate(() => {
        return window.allActivities?.length || 0;
    });
    console.log('window.allActivities.length:', allActivitiesCount);

    // 获取所有活动的详细信息
    const activities = await page.evaluate(() => {
        return window.allActivities || [];
    });

    console.log('活动详情:', activities);
    console.log('活动总数（从JS）:', activities.length);

    // 检查是否有重复的活动
    const titleCounts = {};
    activities.forEach(act => {
        titleCounts[act.title] = (titleCounts[act.title] || 0) + 1;
    });

    console.log('每个标题出现的次数:');
    Object.entries(titleCounts).forEach(([title, count]) => {
        if (count > 1) {
            console.log(`  ⚠️  "${title}": ${count} 次`);
        }
    });
});

test('诊断：测试分类筛选后的实际结果', async ({ page }) => {
    await page.goto('http://localhost:5176');
    await page.waitForSelector('#categoryChips', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // 点击"市集"分类（应该有 16 个活动）
    const categoryChips = page.locator('#categoryChips .filter-chip');
    const marketChip = Array.from(await categoryChips.allTextContents()).find(text => text === '市集');

    if (marketChip) {
        const chipIndex = await categoryChips.allTextContents().then(texts => texts.indexOf('市集'));
        await categoryChips.nth(chipIndex).click();
        await page.waitForTimeout(1000);

        // 从 JavaScript 获取筛选后的数据
        const filtered = await page.evaluate(() => {
            return window.allActivities || [];
        });

        console.log('点击"市集"后，window.allActivities.length:', filtered.length);

        // 检查有多少个活动属于"市集"分类
        const marketActivities = filtered.filter(act => act.category === '市集');
        console.log('其中属于"市集"分类的活动:', marketActivities.length);

        // 检查日历视图中的活动数量
        const calendarChips = page.locator('#calendarGrid .activity-chip');
        const calendarCount = await calendarChips.count();
        console.log('日历视图中显示的活动数:', calendarCount);

        // 列出所有显示的活动
        const displayedTitles = await calendarChips.allTextContents();
        console.log('显示的活动标题:', displayedTitles);
    }
});
