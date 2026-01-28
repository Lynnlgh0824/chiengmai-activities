import { test, expect } from '@playwright/test';

/**
 * 分类筛选功能测试
 *
 * 测试场景：
 * 1. 页面加载时分类按钮正确显示
 * 2. 点击分类按钮后正确筛选活动
 * 3. 筛选后活动数量正确
 * 4. 多次切换分类正确工作
 * 5. 点击"全部"按钮显示所有活动
 */

test.describe('分类筛选功能', () => {
    test.beforeEach(async ({ page }) => {
        // 访问主页
        await page.goto('http://localhost:5173');
        // 等待数据加载
        await page.waitForSelector('#categoryChips', { timeout: 10000 });
        await page.waitForTimeout(1000); // 等待数据加载完成
    });

    test('应该显示所有分类按钮', async ({ page }) => {
        // 获取所有分类按钮
        const categoryChips = page.locator('#categoryChips .filter-chip');
        const count = await categoryChips.count();

        console.log('分类按钮数量:', count);

        // 至少应该有"全部"按钮和至少一个分类
        expect(count).toBeGreaterThanOrEqual(2);

        // 第一个按钮应该是"全部"
        const firstChip = categoryChips.first();
        await expect(firstChip).toHaveText('全部');

        // 记录所有分类
        const categories = [];
        for (let i = 0; i < count; i++) {
            const chip = categoryChips.nth(i);
            const text = await chip.textContent();
            categories.push(text);
            console.log(`  - ${text}`);
        }

        // 验证"全部"按钮是激活状态
        await expect(categoryChips.first()).toHaveClass(/active/);
    });

    test('点击分类按钮应该正确筛选活动', async ({ page }) => {
        // 获取所有分类按钮
        const categoryChips = page.locator('#categoryChips .filter-chip');
        const count = await categoryChips.count();

        // 获取初始活动数量
        const initialCount = await page.locator('#calendarGrid .activity-chip').count();
        console.log('初始活动数量:', initialCount);

        // 点击第二个分类按钮（跳过"全部"）
        if (count > 1) {
            const secondCategory = categoryChips.nth(1);
            const categoryName = await secondCategory.textContent();
            console.log('点击分类:', categoryName);

            await secondCategory.click();

            // 等待筛选完成
            await page.waitForTimeout(500);

            // 检查按钮状态
            await expect(secondCategory).toHaveClass(/active/);

            // 获取筛选后的活动数量
            const filteredCount = await page.locator('#calendarGrid .activity-chip').count();
            console.log('筛选后活动数量:', filteredCount);

            // 筛选后的活动数量应该小于或等于初始数量
            expect(filteredCount).toBeLessThanOrEqual(initialCount);

            // 验证所有显示的活动都属于选中的分类
            const activities = page.locator('.schedule-item');
            const activityCount = await activities.count();

            for (let i = 0; i < Math.min(activityCount, 5); i++) {
                const activity = activities.nth(i);
                const categoryBadge = activity.locator('.category-tag');
                const category = await categoryBadge.textContent();
                console.log(`  活动 ${i + 1} 分类: ${category}`);
                expect(category).toBe(categoryName);
            }
        }
    });

    test('点击"全部"应该显示所有活动', async ({ page }) => {
        const categoryChips = page.locator('#categoryChips .filter-chip');

        // 获取初始活动数量
        const initialCount = await page.locator('#calendarGrid .activity-chip').count();
        console.log('初始活动数量:', initialCount);

        // 点击非"全部"的分类
        if (await categoryChips.count() > 1) {
            await categoryChips.nth(1).click();
            await page.waitForTimeout(500);

            const filteredCount = await page.locator('#calendarGrid .activity-chip').count();
            console.log('筛选后活动数量:', filteredCount);

            // 点击"全部"按钮
            await categoryChips.first().click();
            await page.waitForTimeout(500);

            // 验证活动数量恢复到初始数量
            const restoredCount = await page.locator('#calendarGrid .activity-chip').count();
            console.log('恢复后活动数量:', restoredCount);

            expect(restoredCount).toBe(initialCount);
        }
    });

    test('多次切换分类应该正确工作', async ({ page }) => {
        const categoryChips = page.locator('#categoryChips .filter-chip');
        const count = await categoryChips.count();

        if (count > 2) {
            // 记录每次点击的活动数量
            const counts = [];

            for (let i = 1; i < Math.min(count, 4); i++) {
                await categoryChips.nth(i).click();
                await page.waitForTimeout(500);

                const filteredCount = await page.locator('#calendarGrid .activity-chip').count();
                const categoryName = await categoryChips.nth(i).textContent();
                counts.push({ category: categoryName, count: filteredCount });
                console.log(`${categoryName}: ${filteredCount} 个活动`);
            }

            // 最后点击"全部"
            await categoryChips.first().click();
            await page.waitForTimeout(500);

            const totalCount = await page.locator('#calendarGrid .activity-chip').count();
            console.log(`全部: ${totalCount} 个活动`);

            // 验证总数量应该大于或等于任何单个分类的数量
            for (const { category, count: catCount } of counts) {
                expect(totalCount).toBeGreaterThanOrEqual(catCount);
            }
        }
    });

    test('应该显示筛选标签', async ({ page }) => {
        const categoryChips = page.locator('#categoryChips .filter-chip');

        if (await categoryChips.count() > 1) {
            // 点击一个分类
            await categoryChips.nth(1).click();
            await page.waitForTimeout(500);

            // 检查是否显示筛选标签
            const activeFilters = page.locator('#activeFilters');
            const isVisible = await activeFilters.isVisible();

            if (isVisible) {
                const filterTags = activeFilters.locator('.filter-tag');
                const tagCount = await filterTags.count();
                console.log('筛选标签数量:', tagCount);
                expect(tagCount).toBeGreaterThan(0);

                // 检查标签内容
                const firstTag = filterTags.first();
                const tagText = await firstTag.textContent();
                console.log('筛选标签文本:', tagText);
                expect(tagText).toContain('分类:');
            }
        }
    });

    test('筛选标签的X按钮应该清除筛选', async ({ page }) => {
        const categoryChips = page.locator('#categoryChips .filter-chip');

        if (await categoryChips.count() > 1) {
            // 点击一个分类
            await categoryChips.nth(1).click();
            await page.waitForTimeout(500);

            // 查找并点击筛选标签的X按钮
            const activeFilters = page.locator('#activeFilters');

            if (await activeFilters.isVisible()) {
                const closeButtons = activeFilters.locator('.filter-tag button');
                const count = await closeButtons.count();

                if (count > 0) {
                    await closeButtons.first().click();
                    await page.waitForTimeout(500);

                    // 验证"全部"按钮重新激活
                    await expect(categoryChips.first()).toHaveClass(/active/);
                }
            }
        }
    });

    test('控制台不应该有错误', async ({ page }) => {
        // 监听控制台错误
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // 点击一个分类按钮
        const categoryChips = page.locator('#categoryChips .filter-chip');
        if (await categoryChips.count() > 1) {
            await categoryChips.nth(1).click();
            await page.waitForTimeout(1000);
        }

        // 检查是否有错误
        console.log('控制台错误:', errors);
        expect(errors.length).toBe(0);
    });
});

test.describe('分类筛选-数据验证', () => {
    test('验证分类数据完整性', async ({ page, request }) => {
        // 直接调用 API 获取数据
        const response = await request.get('http://localhost:3000/api/items');
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data).toBeInstanceOf(Array);
        expect(data.data.length).toBeGreaterThan(0);

        // 检查每个活动都有分类字段
        const itemsWithoutCategory = data.data.filter(item => !item.category);
        console.log('缺少分类的活动:', itemsWithoutCategory.length);
        expect(itemsWithoutCategory.length).toBe(0);

        // 获取所有唯一分类
        const categories = [...new Set(data.data.map(item => item.category))];
        console.log('所有分类:', categories);
        console.log('分类数量:', categories.length);
        expect(categories.length).toBeGreaterThan(0);
    });
});
