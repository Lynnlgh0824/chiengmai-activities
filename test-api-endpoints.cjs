#!/usr/bin/env node

/**
 * API 端点自动化测试
 * 测试所有 API 端点的可用性和数据完整性
 */

const http = require('http');

console.log('🌐 开始测试 API 端点...\n');

const BASE_URL = 'http://localhost:3000';
let passed = 0;
let failed = 0;

// 辅助函数：发送 HTTP 请求
function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        }).on('error', reject);
    });
}

// 测试用例
const tests = [
    {
        name: '1. GET /api/health - 健康检查',
        test: async () => {
            const result = await fetch(`${BASE_URL}/api/health`);
            const success = result.status === 200 && result.data.success === true;
            console.log(`   状态码: ${result.status}`);
            console.log(`   响应正确: ${result.data.success === true}`);
            return success;
        }
    },
    {
        name: '2. GET /api/activities - 获取所有活动',
        test: async () => {
            const result = await fetch(`${BASE_URL}/api/activities`);
            const hasData = result.data.success === true && Array.isArray(result.data.data);
            const count = hasData ? result.data.data.length : 0;
            console.log(`   活动数量: ${count}`);
            console.log(`   数据格式正确: ${hasData}`);
            return hasData && count > 0;
        }
    },
    {
        name: '3. GET /api/activities - 数据结构验证',
        test: async () => {
            const result = await fetch(`${BASE_URL}/api/activities`);
            if (!result.data.success || !result.data.data || result.data.data.length === 0) {
                return false;
            }
            const activity = result.data.data[0];
            const hasRequiredFields = activity.id && activity.title && activity.category && activity.time;
            console.log(`   示例活动ID: ${activity.id}`);
            console.log(`   包含必需字段: ${hasRequiredFields}`);
            return hasRequiredFields;
        }
    },
    {
        name: '4. GET /api/categories - 获取分类列表',
        test: async () => {
            const result = await fetch(`${BASE_URL}/api/categories`);
            const success = result.status === 200;
            console.log(`   端点可访问: ${success}`);
            return success;
        }
    },
    {
        name: '5. 验证活动数据完整性',
        test: async () => {
            const result = await fetch(`${BASE_URL}/api/activities`);
            if (!result.data.success || !result.data.data) return false;

            const activities = result.data.data;
            const allHaveId = activities.every(a => a.id);
            const allHaveTitle = activities.every(a => a.title);
            const allHaveCategory = activities.every(a => a.category);
            const allHaveTime = activities.every(a => a.time);

            console.log(`   所有活动有ID: ${allHaveId}`);
            console.log(`   所有活动有标题: ${allHaveTitle}`);
            console.log(`   所有活动有分类: ${allHaveCategory}`);
            console.log(`   所有活动有时间: ${allHaveTime}`);

            return allHaveId && allHaveTitle && allHaveCategory && allHaveTime;
        }
    },
    {
        name: '6. 验证灵活时间活动',
        test: async () => {
            const result = await fetch(`${BASE_URL}/api/activities`);
            if (!result.data.success) return false;

            const flexibleActivities = result.data.data.filter(a => a.flexibleTime === '是');
            const hasFlexible = flexibleActivities.length > 0;
            console.log(`   灵活时间活动数量: ${flexibleActivities.length}`);
            return hasFlexible;
        }
    }
];

// 运行所有测试
(async () => {
    for (const { name, test } of tests) {
        try {
            console.log(`\n${name}`);
            const result = await test();
            if (result) {
                console.log(`✅ 通过\n`);
                passed++;
            } else {
                console.log(`❌ 失败\n`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${name}`);
            console.log(`   错误: ${error.message}\n`);
            failed++;
        }
    }

    // 输出总结
    console.log('='.repeat(50));
    console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
    console.log('='.repeat(50));

    if (failed === 0) {
        console.log('\n🎉 所有 API 测试通过！');
        process.exit(0);
    } else {
        console.log(`\n⚠️  有 ${failed} 个测试失败，请检查。`);
        process.exit(1);
    }
})();
