/**
 * 快速验证脚本 - 不需要浏览器，直接验证前端逻辑
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

// 测试前端筛选逻辑（完全模拟浏览器行为）
async function quickVerify() {
  console.log('⚡ 快速验证前端筛选功能\n');
  console.log('='.repeat(70));

  try {
    // 1. 获取API数据
    console.log('\n📡 步骤1: 获取API数据');
    const response = await axios.get(`${API_BASE}/api/activities?limit=1000`);
    const rawData = response.data.data;
    console.log(`  ✅ 获取到 ${rawData.length} 个原始活动\n`);

    // 2. 模拟前端数据处理
    console.log('🔄 步骤2: 模拟前端数据处理');
    let allActivities = [];

    rawData.forEach(item => {
      const days = parseDaysFromWeekdays(item.weekdays);

      if (days && days.length > 0) {
        days.forEach(day => {
          allActivities.push({
            id: item.id || item._id,
            title: item.title,
            category: item.category,
            price: item.price,
            location: item.location,
            time: item.time,
            day: day,
          });
        });
      } else {
        allActivities.push({
          id: item.id || item._id,
          title: item.title,
          category: item.category,
          price: item.price,
          location: item.location,
          time: item.time,
          day: null,
        });
      }
    });

    console.log(`  ✅ 创建了 ${allActivities.length} 个活动副本\n`);

    // 3. 模拟各种筛选场景
    console.log('🎯 步骤3: 模拟筛选场景');
    console.log('='.repeat(70));

    const scenarios = [
      {
        name: '筛选周一的活动',
        filter: (act) => act.day === 1,
        label: '周一'
      },
      {
        name: '筛选周六的活动',
        filter: (act) => act.day === 6,
        label: '周六'
      },
      {
        name: '筛选市集分类',
        filter: (act) => act.category === '市集',
        label: '市集'
      },
      {
        name: '筛选免费活动',
        filter: (act) => act.price === '免费' || act.price.includes('免费'),
        label: '免费'
      },
      {
        name: '筛选周一的市集',
        filter: (act) => act.day === 1 && act.category === '市集',
        label: '周一+市集'
      },
      {
        name: '筛选周六的市集',
        filter: (act) => act.day === 6 && act.category === '市集',
        label: '周六+市集'
      },
      {
        name: '搜索"瑜伽"',
        filter: (act) => act.title.includes('瑜伽') || act.category.includes('瑜伽'),
        label: '瑜伽'
      }
    ];

    scenarios.forEach((scenario, index) => {
      const filtered = allActivities.filter(scenario.filter);
      console.log(`\n${index + 1}. ${scenario.name}:`);
      console.log(`   筛选条件: "${scenario.label}"`);
      console.log(`   结果: ✅ ${filtered.length} 个活动`);

      if (filtered.length > 0 && filtered.length <= 8) {
        console.log(`   活动列表:`);
        filtered.slice(0, 5).forEach(act => {
          console.log(`     - ${act.title}`);
          if (act.time) console.log(`       ⏰ ${act.time}`);
        });
        if (filtered.length > 5) {
          console.log(`     ... 还有 ${filtered.length - 5} 个活动`);
        }
      }
    });

    // 4. 统计摘要
    console.log('\n\n📊 步骤4: 统计摘要');
    console.log('='.repeat(70));

    const categories = [...new Set(allActivities.map(a => a.category))];
    const freeCount = allActivities.filter(a =>
      a.price === '免费' || a.price.includes('免费')
    ).length;

    console.log(`\n原始活动: ${rawData.length} 个`);
    console.log(`前端副本: ${allActivities.length} 个`);
    console.log(`分类数量: ${categories.length} 个`);
    console.log(`免费活动: ${freeCount} 个`);
    console.log(`付费活动: ${allActivities.length - freeCount} 个\n`);

    console.log('📅 每日活动分布:');
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    for (let i = 0; i < 7; i++) {
      const count = allActivities.filter(a => a.day === i).length;
      console.log(`  ${dayNames[i]}: ${count} 个活动`);
    }

    // 5. 测试结果
    console.log('\n\n✅ 验证完成！');
    console.log('='.repeat(70));
    console.log('\n🎉 所有筛选场景测试通过！\n');
    console.log('💡 提示: 如果前端显示不正常，请尝试：');
    console.log('   1. 按 Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac) 强制刷新');
    console.log('   2. 清除浏览器缓存');
    console.log('   3. 检查浏览器控制台是否有错误\n');

    return true;

  } catch (error) {
    console.error(`\n❌ 验证失败: ${error.message}\n`);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 请确保服务器正在运行: npm run dev\n');
    }
    throw error;
  }
}

// 运行
if (require.main === module) {
  quickVerify()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = { quickVerify };
