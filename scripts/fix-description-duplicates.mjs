#!/usr/bin/env node

/**
 * 修复描述中的重复符号和重复文本
 * - 去掉标签后内容行开头的重复图标
 * - 去掉完全重复的段落
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const itemsJsonPath = path.join(__dirname, '../data/items.json');

// 读取数据
const items = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf-8'));

console.log('📊 开始修复描述中的重复符号和文本...\n');
console.log(`原始数据: ${items.length} 个活动\n`);

let fixCount = 0;
const details = [];

// =====================================================
// 修复逻辑
// =====================================================

items.forEach((item, index) => {
    if (!item.description) return;

    const originalDesc = item.description;
    let fixedDesc = item.description;
    let hasChanges = false;

    // 1. 修复：标签后内容行开头的重复图标
    // 例如："⚠️ 注意事项：\n⚠️ 严格戒律..." → "⚠️ 注意事项：\n严格戒律..."
    const iconPatterns = [
        { regex: /([⚠️👥✨📚🌐💰🌐📞⏰])\s*注意事项[：:]\s*\n\s*[⚠️]\s*/g, icon: '⚠️', label: '注意事项' },
        { regex: /([⚠️👥✨📚🌐💰🌐📞⏰])\s*适合人群[：:]\s*\n\s*[👥]\s*/g, icon: '👥', label: '适合人群' },
        { regex: /([⚠️👥✨📚🌐💰🌐📞⏰])\s*活动特点[：:]\s*\n\s*[✨]\s*/g, icon: '✨', label: '活动特点' },
        { regex: /([⚠️👥✨📚🌐💰🌐📞⏰])\s*课程周期[：:]\s*\n\s*[📚]\s*/g, icon: '📚', label: '课程周期' },
        { regex: /([⚠️👥✨📚🌐💰🌐📞⏰])\s*语言[：:]\s*\n\s*[🌐]\s*/g, icon: '🌐', label: '语言' },
        { regex: /([⚠️👥✨📚🌐💰🌐📞⏰])\s*费用[：:]\s*\n\s*[💰]\s*/g, icon: '💰', label: '费用' },
    ];

    iconPatterns.forEach(({ regex, icon, label }) => {
        const matches = fixedDesc.match(regex);
        if (matches) {
            // 替换：标签行保留，删除内容行开头的图标
            fixedDesc = fixedDesc.replace(regex, `${icon} ${label}：\n`);
            hasChanges = true;
        }
    });

    // 2. 通用修复：删除标签后紧接着的重复图标
    // 匹配模式：图标+标签+换行+空格+相同图标
    const generalPattern = /([⚠️👥✨📚🌐💰🌐📞⏰])\s*([^：:\n]+)[：:]\s*\n\s*\1\s+/g;
    if (generalPattern.test(fixedDesc)) {
        fixedDesc = fixedDesc.replace(generalPattern, (match, icon, label) => {
            return `${icon} ${label}：\n`;
        });
        hasChanges = true;
    }

    // 3. 删除完全重复的连续段落
    const lines = fixedDesc.split('\n').filter(line => line.trim());
    const uniqueLines = [];
    let lastLine = '';

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed !== lastLine) {
            uniqueLines.push(line);
            lastLine = trimmed;
        } else {
            hasChanges = true; // 检测到重复行
        }
    }

    fixedDesc = uniqueLines.join('\n');

    // 4. 清理多余的空行
    fixedDesc = fixedDesc.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    if (hasChanges) {
        item.description = fixedDesc;
        fixCount++;
        details.push({
            id: item.id || item.activityNumber,
            title: item.title,
            original: originalDesc.substring(0, 100),
            fixed: fixedDesc.substring(0, 100)
        });
    }
});

console.log('✅ 修复完成:\n');
console.log(`   修复数量: ${fixCount} 个活动\n`);

if (details.length > 0) {
    console.log('📝 修复详情（前5个）:\n');
    details.slice(0, 5).forEach((detail, i) => {
        console.log(`[${i+1}] [${detail.id}] ${detail.title}`);
        console.log(`   修复前: ${detail.original}...`);
        console.log(`   修复后: ${detail.fixed}...`);
        console.log('');
    });
}

// =====================================================
// 保存修复后的数据
// =====================================================

fs.writeFileSync(itemsJsonPath, JSON.stringify(items, null, 2), 'utf-8');

console.log(`\n✅ 数据已保存到 items.json`);
console.log(`\n💡 建议：运行以下命令重新导出Excel:`);
console.log(`   npm run export-to-excel`);
