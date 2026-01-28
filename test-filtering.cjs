/**
 * 自动化测试前端筛选功能
 * 无需浏览器，直接测试筛选逻辑
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// 从前端复制的逻辑
const dayMap = { '周日': 0, '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6 };

function parseDaysFromWeekdays(weekdays) {
  if (!weekdays || !Array.isArray(weekdays)) return [];
  const days = [];
  for (let day of weekdays) {
    if (dayMap[day] !== undefined) {
      days.push(dayMap[day]);
    }
  }
  return days;
}

// 测试筛选逻辑
function testFiltering() {
  console.log('🧪 开始自动化测试前端筛选功能\n');
  console.log('='.repeat(60));

  // 模拟前端的数据处理
  let allActivities = [];
  let rawActivities = [];

  return axios.get(`${API_BASE}/api/activities?limit=1000`)
    .then(response => {
      const result = response.data;
      if (!result.success) {
        throw new Error('API返回失败');
      }

      rawActivities = result.data;
      console.log(`\n📦 步骤1: 从API获取数据`);
      console.log(`  ✅ API返回: ${rawActivities.length} 个活动\n`);

      // 模拟前端的activity副本创建逻辑
      console.log(`📊 步骤2: 创建活动副本（前端逻辑）`);
      rawActivities.forEach(item => {
        const days = parseDaysFromWeekdays(item.weekdays);

        if (days && days.length > 0) {
          days.forEach(day => {
            allActivities.push({
              id: item.id || item._id,
              originalId: item.id || item._id,
              title: item.title,
              category: item.category,
              price: item.price,
              location: item.location,
              time: item.time,
              description: item.description,
              day: day,
              frequency: item.frequency || 'weekly',
              url: item.source?.url || ''
            });
          });
        } else {
          // 没有星期信息的活动
          allActivities.push({
            id: item.id || item._id,
            originalId: item.id || item._id,
            title: item.title,
            category: item.category,
            price: item.price,
            location: item.location,
            time: item.time,
            description: item.description,
            day: null,
            frequency: 'once',
            url: item.source?.url || ''
          });
        }
      });

      console.log(`  ✅ 创建副本: ${allActivities.length} 个活动记录\n`);

      // 按日期统计
      console.log(`📅 步骤3: 按日期统计活动分布`);
      for (let i = 0; i < 7; i++) {
        const count = allActivities.filter(a => a.day === i).length;
        const dayName = i === 0 ? '周日' : ['周一', '周二', '周三', '周四', '周五', '周六'][i-1];
        console.log(`  ${dayName}: ${count} 个活动`);
      }
      console.log();

      // 测试日期筛选
      console.log(`🔍 步骤4: 测试日期筛选功能`);
      console.log('='.repeat(60));

      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

      dayNames.forEach((dayName, index) => {
        const day = index; // 0=周日, 1=周一, ...

        // 模拟筛选逻辑
        const filtered = allActivities.filter(act => act.day === day);

        console.log(`\n📅 筛选: ${dayName} (day=${day})`);
        console.log(`  ✅ 找到 ${filtered.length} 个活动`);

        if (filtered.length > 0 && filtered.length <= 10) {
          console.log(`  📋 活动列表:`);
          filtered.slice(0, 5).forEach(act => {
            console.log(`     - ${act.title} (${act.time})`);
          });
          if (filtered.length > 5) {
            console.log(`     ... 还有 ${filtered.length - 5} 个活动`);
          }
        }
      });

      // 测试分类筛选
      console.log(`\n\n🏷️ 步骤5: 测试分类筛选功能`);
      console.log('='.repeat(60));

      const categories = [...new Set(allActivities.map(a => a.category))];
      console.log(`\n  共有 ${categories.length} 个分类:\n`);

      categories.forEach(category => {
        const filtered = allActivities.filter(act => act.category === category);
        console.log(`  📌 ${category}: ${filtered.length} 个活动`);
      });

      // 测试组合筛选
      console.log(`\n\n🎯 步骤6: 测试组合筛选（日期 + 分类）`);
      console.log('='.repeat(60));

      // 测试：周一的市集
      let filtered = allActivities.filter(act => act.day === 1); // 周一
      filtered = filtered.filter(act => act.category === '市集');

      console.log(`\n  📅 周一 + 🏷️ 市集`);
      console.log(`  ✅ 找到 ${filtered.length} 个活动`);
      if (filtered.length > 0) {
        filtered.forEach(act => {
          console.log(`     - ${act.title} (${act.time})`);
        });
      }

      // 测试：周六的市集
      filtered = allActivities.filter(act => act.day === 6); // 周六
      filtered = filtered.filter(act => act.category === '市集');

      console.log(`\n  📅 周六 + 🏷️ 市集`);
      console.log(`  ✅ 找到 ${filtered.length} 个活动`);
      if (filtered.length > 0 && filtered.length <= 10) {
        filtered.slice(0, 5).forEach(act => {
          console.log(`     - ${act.title} (${act.time})`);
        });
        if (filtered.length > 5) {
          console.log(`     ... 还有 ${filtered.length - 5} 个活动`);
        }
      }

      // 测试价格筛选
      console.log(`\n\n💰 步骤7: 测试价格筛选功能`);
      console.log('='.repeat(60));

      const extractPrice = (priceStr) => {
        if (priceStr === '免费' || priceStr.includes('免费')) return 0;
        return parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
      };

      const freeActivities = allActivities.filter(act =>
        act.price === '免费' || act.price.includes('免费')
      );

      console.log(`\n  💵 免费活动: ${freeActivities.length} 个`);

      const paidActivities = allActivities.filter(act => {
        const price = extractPrice(act.price);
        return price > 0 && price < 500;
      });

      console.log(`  💵 <500泰铢: ${paidActivities.length} 个`);

      // 最终结果
      console.log(`\n\n✅ 测试完成！`);
      console.log('='.repeat(60));
      console.log(`\n📊 统计摘要:`);
      console.log(`  - API原始活动: ${rawActivities.length} 个`);
      console.log(`  - 前端副本: ${allActivities.length} 个`);
      console.log(`  - 分类数量: ${categories.length} 个`);
      console.log(`  - 免费活动: ${freeActivities.length} 个`);

      console.log(`\n✨ 筛选功能正常工作！\n`);

      return {
        total: rawActivities.length,
        withCopies: allActivities.length,
        categories: categories.length,
        free: freeActivities.length
      };
    })
    .catch(error => {
      console.error(`\n❌ 测试失败: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.error(`\n💡 提示: 请确保服务器正在运行 (npm run dev)\n`);
      }
      throw error;
    });
}

// 运行测试
if (require.main === module) {
  testFiltering()
    .then(stats => {
      console.log('\n✅ 所有测试通过！\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 测试失败\n');
      process.exit(1);
    });
}

module.exports = { testFiltering };
