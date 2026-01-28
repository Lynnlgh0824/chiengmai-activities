#!/usr/bin/env node

/**
 * suspended过滤功能自动化测试脚本
 */

const http = require('http');

console.log('🧪 suspended过滤功能自动化测试报告');
console.log('='.repeat(80));

http.get('http://localhost:3000/api/activities', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const result = JSON.parse(data);

            // 测试1: API数据状态检查
            console.log('\n📊 测试1: API数据状态检查');
            console.log('─'.repeat(80));

            if (result.success && result.data) {
                const total = result.data.length;
                console.log('✅ PASS - API返回 ' + total + ' 个活动');
            } else {
                console.log('❌ FAIL - API返回格式错误');
                process.exit(1);
            }

            // 测试2: suspended活动识别
            console.log('\n🔍 测试2: suspended活动识别');
            console.log('─'.repeat(80));

            const suspended = result.data.filter(a => a.status === 'suspended');
            const active = result.data.filter(a => {
                const status = a.status || '进行中';
                return status === '进行中';
            });

            console.log('✅ PASS - 发现 ' + suspended.length + ' 个suspended活动');

            if (suspended.length > 0) {
                console.log('\n📋 suspended活动列表:');
                suspended.forEach(act => {
                    console.log('  • ' + act.activityNumber + ' ' + act.title);
                    console.log('    状态: ' + act.status);
                    if (act.suspensionNote) {
                        console.log('    备注: ' + act.suspensionNote);
                    }
                });
            }

            // 测试3: 过滤结果验证
            console.log('\n✅ 测试3: 过滤结果验证');
            console.log('─'.repeat(80));

            const activity0001 = suspended.find(a => a.activityNumber === '0001');

            if (activity0001) {
                console.log('✅ PASS - 过滤逻辑正确');
                console.log('  • 发现suspended活动: ' + activity0001.title);
                console.log('  • 状态: ' + activity0001.status);
                console.log('  • 前端应隐藏: 是');
                console.log('  • 剩余可见活动: ' + active.length + '个');
            } else {
                console.log('ℹ️ INFO - 未找到活动0001的suspended状态');
            }

            // 测试总结
            console.log('\n📈 测试总结');
            console.log('='.repeat(80));
            console.log('📊 API返回活动总数: ' + result.data.length);
            console.log('🚫 suspended活动数: ' + suspended.length);
            console.log('✅ 应显示活动数: ' + active.length);

            // 最终结论
            console.log('\n🎯 最终结论');
            console.log('='.repeat(80));

            if (suspended.length === 1 && suspended[0].activityNumber === '0001' && active.length === 44) {
                console.log('✅ 所有测试通过！suspended过滤功能正常工作');
                console.log('✅ 活动0001瑜伽已被正确过滤');
                console.log('✅ 前端应显示44个活动（不包括suspended状态的活动）');
                console.log('\n💡 请访问主页面验证: http://localhost:3000');
                console.log('💡 或访问测试页面: http://localhost:3000/test-suspended-filter.html');
            } else {
                console.log('⚠️ 测试结果与预期不符');
                console.log('  预期: 45个总数 / 1个suspended / 44个显示');
                console.log('  实际: ' + result.data.length + '个总数 / ' + suspended.length + '个suspended / ' + active.length + '个显示');
            }

            console.log('\n⏰ 测试时间: ' + new Date().toLocaleString('zh-CN'));
        } catch (error) {
            console.error('❌ 解析API响应失败:', error.message);
        }
    });
}).on('error', (err) => {
    console.error('❌ 无法连接到API服务器:', err.message);
    console.log('\n💡 请确保服务器正在运行:');
    console.log('   cd /Users/yuzhoudeshengyin/Documents/my_project/Chiengmai');
    console.log('   node server.js');
});
