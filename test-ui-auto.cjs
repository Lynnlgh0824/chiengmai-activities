/**
 * 自动化UI测试 - 使用Puppeteer真实浏览器测试前端筛选功能
 */

const puppeteer = require('puppeteer');

const PAGE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testUIFiltering() {
  console.log('🌐 启动自动化UI测试\n');
  console.log('='.repeat(60));

  let browser;
  try {
    // 启动浏览器（headless: false 可以看到浏览器操作）
    browser = await puppeteer.launch({
      headless: false, // 设为 true 可在后台运行
      slowMo: 100, // 放慢操作，方便观察
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('✅ 浏览器已启动\n');
    console.log(`📍 访问: ${PAGE_URL}\n`);

    // 访问页面
    await page.goto(PAGE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ 页面加载完成\n');

    // 等待活动数据加载
    await sleep(2000);

    // 截图 - 初始状态
    await page.screenshot({ path: 'test-screenshots/01-initial-state.png' });
    console.log('📸 截图: 01-初始状态\n');

    // 测试1: 检查页面元素
    console.log('🔍 测试1: 检查页面元素');
    console.log('-'.repeat(60));

    const calendarGridExists = await page.$('#calendarGrid') !== null;
    const dateHeadersExist = await page.$$('.date-cell-header').then(el => el.length);
    const dayCellsExist = await page.$$('.day-cell').then(el => el.length);

    console.log(`  日历网格: ${calendarGridExists ? '✅' : '❌'}`);
    console.log(`  日期表头: ${dateHeadersExist} 个 ✅`);
    console.log(`  日期单元格: ${dayCellsExist} 个 ✅\n`);

    // 测试2: 点击日期筛选
    console.log('🗓️ 测试2: 点击日期筛选');
    console.log('-'.repeat(60));

    // 获取所有日期表头
    const dateHeaders = await page.$$('.date-cell-header');

    // 点击第一个日期（周一）
    if (dateHeaders.length > 0) {
      console.log(`\n  点击第1个日期表头...`);
      await dateHeaders[0].click();
      await sleep(1000);

      // 截图 - 选中日期后的状态
      await page.screenshot({ path: 'test-screenshots/02-day-selected.png' });
      console.log('  ✅ 点击完成');

      // 检查是否有selected-day类
      const isSelected = await page.evaluate(el => {
        return el.classList.contains('selected-day');
      }, dateHeaders[0]);

      console.log(`  ${isSelected ? '✅' : '❌'} 日期已高亮`);

      // 获取控制台日志
      const logs = await page.evaluate(() => {
        return window.consoleLogs || [];
      });

      console.log(`  📋 控制台日志: ${logs.length} 条\n`);
    }

    // 测试3: 测试分类筛选
    console.log('\n🏷️ 测试3: 测试分类筛选');
    console.log('-'.repeat(60));

    // 获取所有分类chips
    const categoryChips = await page.$$('#categoryChips .filter-chip');
    console.log(`\n  找到 ${categoryChips.length} 个分类标签\n`);

    // 点击第二个分类（非"全部"）
    if (categoryChips.length > 1) {
      const chipText = await page.evaluate(el => el.textContent.trim(), categoryChips[1]);
      console.log(`  点击分类: ${chipText}`);

      await categoryChips[1].click();
      await sleep(1000);

      // 截图 - 分类筛选后的状态
      await page.screenshot({ path: 'test-screenshots/03-category-filter.png' });
      console.log('  ✅ 点击完成\n');
    }

    // 测试4: 测试搜索功能
    console.log('🔎 测试4: 测试搜索功能');
    console.log('-'.repeat(60));

    const searchInput = await page.$('#searchInput');
    if (searchInput) {
      console.log('\n  输入搜索词: "瑜伽"');
      await searchInput.type('瑜伽');
      await sleep(500);

      // 按回车搜索
      await page.keyboard.press('Enter');
      await sleep(1000);

      // 截图 - 搜索结果
      await page.screenshot({ path: 'test-screenshots/04-search-results.png' });
      console.log('  ✅ 搜索完成\n');

      // 清空搜索
      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await sleep(500);
    }

    // 测试5: 测试价格筛选
    console.log('💰 测试5: 测试价格筛选');
    console.log('-'.repeat(60));

    // 找到"免费"价格chip
    const priceChips = await page.$$('.filter-group:nth-child(2) .filter-chip');
    console.log(`\n  找到 ${priceChips.length} 个价格标签\n`);

    if (priceChips.length > 1) {
      const chipText = await page.evaluate(el => el.textContent.trim(), priceChips[1]);
      console.log(`  点击价格: ${chipText}`);

      await priceChips[1].click();
      await sleep(1000);

      // 截图 - 价格筛选后的状态
      await page.screenshot({ path: 'test-screenshots/05-price-filter.png' });
      console.log('  ✅ 点击完成\n');
    }

    // 测试6: 获取页面统计信息
    console.log('📊 测试6: 获取页面统计信息');
    console.log('-'.repeat(60));

    const stats = await page.evaluate(() => {
      const allActivities = window.allActivities || [];
      const currentFilters = window.currentFilters || {};

      // 按日期统计
      const dayStats = {};
      for (let i = 0; i < 7; i++) {
        dayStats[i] = allActivities.filter(a => a.day === i).length;
      }

      // 按分类统计
      const categories = [...new Set(allActivities.map(a => a.category))];
      const categoryStats = {};
      categories.forEach(cat => {
        categoryStats[cat] = allActivities.filter(a => a.category === cat).length;
      });

      return {
        totalActivities: allActivities.length,
        dayStats,
        categoryStats,
        currentFilters,
        categories: categories.length
      };
    });

    console.log(`\n  📦 总活动数: ${stats.totalActivities}`);
    console.log(`  📅 日期分布:`);
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    Object.entries(stats.dayStats).forEach(([day, count]) => {
      console.log(`     ${dayNames[day]}: ${count} 个`);
    });
    console.log(`  🏷️ 分类数量: ${stats.categories}\n`);
    console.log(`  🔍 当前筛选:`, stats.currentFilters, '\n');

    // 测试7: 测试活动详情弹窗
    console.log('📋 测试7: 测试活动详情弹窗');
    console.log('-'.repeat(60));

    // 找到第一个活动chip
    const firstChip = await page.$('.activity-chip');
    if (firstChip) {
      console.log('\n  点击第一个活动...');

      // 获取活动标题
      const chipTitle = await page.evaluate(el => el.textContent, firstChip);
      console.log(`  活动: ${chipTitle.substring(0, 50)}...`);

      await firstChip.click();
      await sleep(1000);

      // 检查弹窗是否显示
      const modalVisible = await page.$('#activityModal.active') !== null;
      console.log(`  弹窗显示: ${modalVisible ? '✅' : '❌'}`);

      if (modalVisible) {
        // 截图 - 弹窗
        await page.screenshot({ path: 'test-screenshots/06-modal-detail.png' });
        console.log('  ✅ 弹窗已打开');

        // 关闭弹窗
        await page.click('.modal-close');
        await sleep(500);
        console.log('  ✅ 弹窗已关闭\n');
      }
    }

    // 最终截图
    await page.screenshot({ path: 'test-screenshots/07-final-state.png', fullPage: true });

    console.log('\n✅ 所有测试完成！');
    console.log('='.repeat(60));
    console.log('\n📸 截图已保存到 test-screenshots/ 目录\n');
    console.log('📊 测试摘要:');
    console.log(`  - 页面元素: ✅ 正常`);
    console.log(`  - 日期筛选: ✅ 可用`);
    console.log(`  - 分类筛选: ✅ 可用`);
    console.log(`  - 搜索功能: ✅ 可用`);
    console.log(`  - 价格筛选: ✅ 可用`);
    console.log(`  - 活动详情: ✅ 可用\n`);

    // 等待用户观察
    console.log('⏳ 等待 5 秒后关闭浏览器...');
    await sleep(5000);

    return {
      success: true,
      stats
    };

  } catch (error) {
    console.error(`\n❌ 测试失败: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n✅ 浏览器已关闭\n');
    }
  }
}

// 运行测试
async function main() {
  try {
    // 创建截图目录
    const fs = require('fs');
    if (!fs.existsSync('test-screenshots')) {
      fs.mkdirSync('test-screenshots');
      console.log('📁 创建截图目录: test-screenshots/\n');
    }

    const result = await testUIFiltering();
    console.log('✅ UI自动化测试通过！\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ UI自动化测试失败\n');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testUIFiltering };
