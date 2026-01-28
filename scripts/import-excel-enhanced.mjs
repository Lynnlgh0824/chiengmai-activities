#!/usr/bin/env node

/**
 * 增强的Excel导入脚本
 * 功能：自动导入Excel到后台，包含备份、验证、日志
 * 用法: npm run import-excel
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    validateBatch,
    validateItem,
    generateActivityNumber,
    detectTimeLocationConflicts
} from './validators.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXCEL_FILE = path.join(__dirname, '../清迈活动数据.xlsx');
const BACKUP_DIR = path.join(__dirname, '../backups');
const JSON_FILE = path.join(__dirname, '../data/items.json');
const LOG_DIR = path.join(__dirname, '../logs');

// 生成Markdown格式的错误报告
function generateErrorMarkdownReport(errorReport) {
    const { timestamp, filename, summary, errors } = errorReport;

    let md = '# Excel 导入错误报告\n\n';
    md += `**文件名**: ${filename}\n`;
    md += `**时间**: ${new Date(timestamp).toLocaleString('zh-CN')}\n\n`;

    md += '## 📊 错误统计\n\n';
    md += `- **总记录数**: ${summary.total}\n`;
    md += `- **验证通过**: ${summary.success}\n`;
    md += `- **验证失败**: ${summary.failed}\n`;
    md += `- **错误总数**: ${summary.errorCount}\n\n`;

    md += '## ❌ 详细错误列表\n\n';

    errors.forEach((err, idx) => {
        md += `### ${idx + 1}. 第 ${err.row} 行 - ${err.title}\n\n`;
        md += `- **字段**: ${err.field}\n`;
        md += `- **错误**: ${err.error}\n`;
        if (err.suggestion) {
            md += `- **建议**: ${err.suggestion}\n`;
        }
        md += '\n';
    });

    md += '---\n\n';
    md += '*此报告由 Excel 导入脚本自动生成*\n';

    return md;
}

console.log('📥 开始从Excel导入数据到后台...\n');

// 创建必要的目录
[BACKUP_DIR, LOG_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
});

// 生成时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.xlsx`);
const logFile = path.join(LOG_DIR, `import-${timestamp}.log`);

// 日志函数
const logs = [];
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry);
}

// 步骤1: 检查Excel文件
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log('步骤1: 检查Excel文件');

if (!fs.existsSync(EXCEL_FILE)) {
    log('❌ Excel文件不存在，请检查文件路径', 'error');
    process.exit(1);
}

const stats = fs.statSync(EXCEL_FILE);
log(`✅ 找到Excel文件: ${EXCEL_FILE}`);
log(`   文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
log(`   修改时间: ${stats.mtime.toLocaleString('zh-CN')}`);

// 步骤2: 备份Excel文件
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log('步骤2: 备份Excel文件');

try {
    fs.copyFileSync(EXCEL_FILE, backupFile);
    log(`✅ 备份完成: ${path.basename(backupFile)}`);
} catch (error) {
    log(`❌ 备份失败: ${error.message}`, 'error');
    process.exit(1);
}

// 步骤3: 读取Excel数据
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log('步骤3: 读取Excel数据');

try {
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    log(`✅ 成功读取 ${rawData.length} 条记录`);

    // 显示前几条预览
    log('\n📋 数据预览:');
    rawData.slice(0, 3).forEach((row, i) => {
        const num = row['活动编号'] || row.activityNumber || 'N/A';
        const title = row['活动标题'] || row.title || '未命名';
        log(`   ${i + 1}. ${num} - ${title}`);
    });

    // 步骤4: 字段映射和数据转换
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('步骤4: 字段映射和数据转换');

    const fieldMapping = {
        'id': 'id',
        '活动标题': 'title',
        '活动标题*': 'title',
        '分类': 'category',
        '分类*': 'category',
        '地点': 'location',
        '地点名称': 'location',
        '地点名称*': 'location',
        '时间': 'time',
        '时间*': 'time',
        '星期': 'weekdays',
        '星期*': 'weekdays',
        '价格': 'price',
        '价格显示': 'price',
        '描述': 'description',
        '活动描述': 'description',
        '活动描述*': 'description',
        '状态': 'status',
        '需要预约': 'requireBooking',
        '灵活时间': 'flexibleTime',
        '持续时间': 'duration',
        '最低价格': 'minPrice',
        '最高价格': 'maxPrice',
        '最大人数': 'maxParticipants',
        '时间信息': 'timeInfo',
        '序号': 'sortOrder',
        '活动编号': 'activityNumber',
        '来源链接': 'sourceLink',
        '链接': 'sourceLink',
        'URL': 'sourceLink',
        'url': 'sourceLink'
    };

    // 读取旧数据用于对比
    let oldData = [];
    if (fs.existsSync(JSON_FILE)) {
        try {
            oldData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
            log(`✅ 读取到旧数据: ${oldData.length} 条记录`);
        } catch (error) {
            log(`⚠️  无法读取旧数据: ${error.message}`, 'warn');
        }
    }

    // 映射和转换数据
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    let mappedData = rawData.map((row, index) => {
        const item = {};

        // 映射所有字段
        Object.keys(row).forEach(key => {
            const mappedKey = fieldMapping[key] || key;
            item[mappedKey] = row[key];
        });

        // 使用活动编号作为ID（去掉Excel中的id列）
        const activityNumber = item.activityNumber || item['活动编号'];
        if (!activityNumber) {
            log(`⚠️  第 ${index + 1} 行缺少活动编号，跳过`, 'warn');
            skipCount++;
            return null;
        }

        // 使用活动编号作为唯一标识
        item.id = activityNumber;

        // 处理星期字段（转换为数组）
        if (item.weekdays && typeof item.weekdays === 'string') {
            item.weekdays = item.weekdays.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
        }

        successCount++;
        return item;
    }).filter(item => item !== null);

    log(`✅ 数据映射完成:`);
    log(`   成功: ${successCount} 条`);
    log(`   跳过: ${skipCount} 条`);
    log(`   错误: ${errorCount} 条`);

    // 步骤4.5: Excel 内部重复检测（编号和标题）
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('步骤4.5: 唯一性检测（活动编号 + 活动标题）');

    // 4.5.1 检测活动编号重复
    const activityNumberMap = new Map(); // 活动编号 -> 行号数组
    const numberDuplicates = [];

    mappedData.forEach((item, index) => {
        const num = String(item.activityNumber || item['活动编号'] || '');
        if (!num) return;

        if (activityNumberMap.has(num)) {
            activityNumberMap.get(num).push({ index, item });
        } else {
            activityNumberMap.set(num, [{ index, item }]);
        }
    });

    // 找出重复的活动编号
    activityNumberMap.forEach((occurrences, num) => {
        if (occurrences.length > 1) {
            numberDuplicates.push({
                activityNumber: num,
                occurrences: occurrences,
                count: occurrences.length
            });
        }
    });

    // 4.5.2 检测活动标题重复
    const titleMap = new Map(); // 活动标题 -> 行号数组
    const titleDuplicates = [];

    mappedData.forEach((item, index) => {
        const title = String(item.title || item['活动标题'] || '').trim();
        if (!title) return;

        if (titleMap.has(title)) {
            titleMap.get(title).push({ index, item });
        } else {
            titleMap.set(title, [{ index, item }]);
        }
    });

    // 找出重复的活动标题
    titleMap.forEach((occurrences, title) => {
        if (occurrences.length > 1) {
            titleDuplicates.push({
                title: title,
                occurrences: occurrences,
                count: occurrences.length
            });
        }
    });

    // 4.5.3 显示重复检测结果
    const hasDuplicates = numberDuplicates.length > 0 || titleDuplicates.length > 0;

    if (hasDuplicates) {
        log(`⚠️  发现重复数据，需要确认！`, 'warn');

        if (numberDuplicates.length > 0) {
            log(`\n📌 活动编号重复 (${numberDuplicates.length}个):`, 'warn');
            numberDuplicates.forEach(dup => {
                log(`\n   编号 ${dup.activityNumber} 重复 ${dup.count} 次:`, 'warn');
                dup.occurrences.forEach(({ index, item }) => {
                    const rowNum = index + 1;
                    log(`      行 ${rowNum}: ${item.title}`, 'warn');
                });
            });
        }

        if (titleDuplicates.length > 0) {
            log(`\n📌 活动标题重复 (${titleDuplicates.length}个):`, 'warn');
            titleDuplicates.forEach(dup => {
                log(`\n   标题 "${dup.title}" 重复 ${dup.count} 次:`, 'warn');
                dup.occurrences.forEach(({ index, item }) => {
                    const rowNum = index + 1;
                    log(`      行 ${rowNum}: 编号 ${item.activityNumber || 'N/A'}`, 'warn');
                });
            });
        }

        // 生成重复报告
        const duplicateReport = {
            timestamp: new Date().toISOString(),
            filename: path.basename(EXCEL_FILE),
            summary: {
                numberDuplicates: numberDuplicates.length,
                titleDuplicates: titleDuplicates.length,
                totalDuplicates: numberDuplicates.length + titleDuplicates.length
            },
            numberDuplicates: numberDuplicates.map(dup => ({
                number: dup.activityNumber,
                count: dup.count,
                occurrences: dup.occurrences.map(({ index, item }) => ({
                    row: index + 1,
                    title: item.title
                }))
            })),
            titleDuplicates: titleDuplicates.map(dup => ({
                title: dup.title,
                count: dup.count,
                occurrences: dup.occurrences.map(({ index, item }) => ({
                    row: index + 1,
                    number: item.activityNumber
                }))
            }))
        };

        const reportFile = path.join(__dirname, `../logs/duplicate-report-${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(duplicateReport, null, 2), 'utf8');

        log(`\n📋 重复报告已保存: ${path.basename(reportFile)}`);
        log(`\n❌ 导入暂停：发现重复数据，请处理后重试`, 'error');
        log(`\n💡 建议操作:`);
        log(`   1. 查看重复报告: ${reportFile}`);
        log(`   2. 在Excel中删除重复的行`);
        log(`   3. 或者运行: node scripts/remove-duplicates.mjs`);

        process.exit(1);
    }

    log(`✅ 唯一性检测通过：无重复的活动编号和标题`);

    // 步骤5: 数据验证（使用统一验证模块）
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('步骤5: 数据验证（统一验证模块）');

    // 检查并自动生成缺失的活动编号
    let autoGeneratedCount = 0;
    mappedData.forEach((item, index) => {
        if (!item.activityNumber || item.activityNumber.trim() === '') {
            const newNumber = generateActivityNumber(oldData);
            item.activityNumber = newNumber;
            item.id = newNumber;
            autoGeneratedCount++;
            log(`   ✅ 第 ${index + 1} 行自动生成编号: ${newNumber}`);
        }
    });

    if (autoGeneratedCount > 0) {
        log(`\n💡 自动生成了 ${autoGeneratedCount} 个活动编号`);
    }

    // 使用统一验证模块进行批量验证
    const validationResult = validateBatch(mappedData, {
        existingData: oldData,
        autoGenerateNumbers: false // 已经在上面处理了
    });

    log(`   验证统计:`);
    log(`   - 总数: ${validationResult.summary.total} 条`);
    log(`   - 通过: ${validationResult.summary.success} 条`);
    log(`   - 失败: ${validationResult.summary.failed} 条`);

    if (validationResult.errors.length > 0) {
        log(`\n⚠️  发现 ${validationResult.errors.length} 个验证错误:\n`);

        // 显示所有错误（按行号排序）
        const sortedErrors = [...validationResult.errors].sort((a, b) => a.itemCount - b.itemCount);

        sortedErrors.forEach((err, idx) => {
            log(`   ${idx + 1}. 第${err.itemCount}行 "${err.item}":`, 'warn');
            log(`      ❌ 字段: ${err.fieldName}`, 'warn');
            log(`      📝 错误: ${err.error}`, 'warn');
            if (err.suggestion) {
                log(`      💡 建议: ${err.suggestion}`, 'info');
            }
            log('');
        });

        // 生成JSON格式的错误报告
        const errorReport = {
            timestamp: new Date().toISOString(),
            filename: path.basename(EXCEL_FILE),
            summary: {
                total: validationResult.summary.total,
                failed: validationResult.summary.failed,
                success: validationResult.summary.success,
                errorCount: validationResult.errors.length
            },
            errors: sortedErrors.map(err => ({
                row: err.itemCount,
                title: err.item,
                field: err.fieldName,
                error: err.error,
                suggestion: err.suggestion || ''
            }))
        };

        const errorJsonFile = path.join(__dirname, `../logs/import-error-${Date.now()}.json`);
        fs.writeFileSync(errorJsonFile, JSON.stringify(errorReport, null, 2), 'utf8');

        // 生成Markdown格式的易读错误报告
        const errorMdReport = generateErrorMarkdownReport(errorReport);
        const errorMdFile = path.join(__dirname, `../logs/import-error-${Date.now()}.md`);
        fs.writeFileSync(errorMdFile, errorMdReport, 'utf8');

        log(`\n📋 错误报告已保存:`);
        log(`   - JSON格式: ${path.basename(errorJsonFile)}`);
        log(`   - Markdown格式: ${path.basename(errorMdFile)}`);

        log(`\n❌ 导入失败：请修正上述错误后重试`);
        log(`\n💡 提示：`);
        log(`   1. 在Excel中修正上述错误`);
        log(`   2. 确保必填字段不为空`);
        log(`   3. 检查日期、时间等格式是否正确`);
        log(`   4. 查看错误报告获取详细信息`);

        process.exit(1);
    }

    log(`\n✅ 验证通过: 所有数据格式正确`);

    // 使用验证后的数据
    mappedData = validationResult.validData;

    // 步骤6: 基于活动编号去重并生成变更报告
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('步骤6: 基于活动编号去重并生成变更报告');

    // 使用活动编号作为唯一性判断标准
    const oldActivityNumbers = new Set(
        oldData
            .map(item => String(item.activityNumber || item['活动编号'] || ''))
            .filter(num => num) // 过滤掉空值
    );

    const newActivityNumbers = new Set(
        mappedData
            .map(item => String(item.activityNumber || item['活动编号'] || ''))
            .filter(num => num) // 过滤掉空值
    );

    // 找出新增的（旧数据中不存在的活动编号）
    const added = mappedData.filter(item => {
        const num = String(item.activityNumber || item['活动编号'] || '');
        return num && !oldActivityNumbers.has(num);
    });

    // 找出删除的（新数据中不存在的活动编号）
    const removed = oldData.filter(item => {
        const num = String(item.activityNumber || item['活动编号'] || '');
        return num && !newActivityNumbers.has(num);
    });

    // 找出更新的（活动编号相同，但可能内容不同）
    const updatedWithChanges = mappedData
        .filter(item => {
            const num = String(item.activityNumber || item['活动编号'] || '');
            return num && oldActivityNumbers.has(num);
        })
        .map(newItem => {
            const num = String(newItem.activityNumber || newItem['活动编号'] || '');
            const oldItem = oldData.find(item =>
                String(item.activityNumber || item['活动编号'] || '') === num
            );

            // 检测字段级变更
            const changes = [];
            const fieldsToCheck = ['title', 'category', 'location', 'price', 'time', 'weekdays'];

            fieldsToCheck.forEach(field => {
                const oldVal = oldItem ? oldItem[field] : undefined;
                const newVal = newItem[field];

                // 处理数组比较（如 weekdays）
                if (Array.isArray(oldVal) && Array.isArray(newVal)) {
                    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                        changes.push({
                            field,
                            old: oldVal,
                            new: newVal
                        });
                    }
                } else if (oldVal !== newVal) {
                    changes.push({
                        field,
                        old: oldVal,
                        new: newVal
                    });
                }
            });

            return {
                newItem,
                oldItem,
                changes,
                hasChanges: changes.length > 0
            };
        });

    // 分出有实际变更的和没有变更的
    const updated = updatedWithChanges.filter(u => u.hasChanges);
    const unchanged = updatedWithChanges.filter(u => !u.hasChanges);

    log(`📊 变更统计（基于活动编号）:`);
    log(`   新增: ${added.length} 条`);
    log(`   删除: ${removed.length} 条`);
    log(`   更新: ${updated.length} 条（有字段变更）`);
    if (unchanged.length > 0) {
        log(`   未变更: ${unchanged.length} 条（内容相同）`);
    }

    // 详细显示更新项的字段变更
    if (updated.length > 0) {
        log('\n📝 字段级变更详情:');
        updated.forEach(({ newItem, changes }) => {
            const num = newItem.activityNumber || 'N/A';
            log(`   ${num}: ${newItem.title}`);
            changes.forEach(change => {
                const fieldNameMap = {
                    title: '标题',
                    category: '分类',
                    location: '地点',
                    price: '价格',
                    time: '时间',
                    weekdays: '星期'
                };
                const fieldName = fieldNameMap[change.field] || change.field;
                const oldVal = Array.isArray(change.old) ? change.old.join(', ') : (change.old || '-');
                const newVal = Array.isArray(change.new) ? change.new.join(', ') : (change.new || '-');
                log(`      - ${fieldName}: "${oldVal}" → "${newVal}"`);
            });
        });
    }

    if (added.length > 0) {
        log('\n➕ 新增活动:');
        added.forEach(item => {
            log(`   - ${item.activityNumber || 'N/A'}: ${item.title}`);
        });
    }

    if (removed.length > 0) {
        log('\n➖ 删除活动:');
        removed.forEach(item => {
            log(`   - ${item.activityNumber || 'N/A'}: ${item.title}`);
        });
    }

    if (unchanged.length > 0) {
        log('\n✓ 内容未变更（已保留）:');
        unchanged.forEach(({ newItem }) => {
            log(`   - ${newItem.activityNumber || 'N/A'}: ${newItem.title}`);
        });
    }

    // 步骤7: 保存到JSON（使用智能合并策略）
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('步骤7: 智能合并数据并保存');

    // 智能合并函数：Excel 空值保留后台原数据
    function smartMerge(newData, oldDataMap) {
        return newData.map(newItem => {
            const num = String(newItem.activityNumber || newItem['活动编号'] || '');
            if (!num || !oldDataMap.has(num)) {
                return newItem; // 新增或无活动编号，直接返回
            }

            const oldItem = oldDataMap.get(num);
            const merged = { ...newItem };

            // 对关键字段，如果 Excel 中为空，则保留后台原值
            const preserveIfEmpty = ['title', 'category', 'location', 'price', 'time', 'weekdays', 'description'];
            let preservedCount = 0;

            preserveIfEmpty.forEach(field => {
                const newVal = newItem[field];
                const oldVal = oldItem[field];

                // 如果新值为空、null、undefined 或 '-'，保留旧值
                if (!newVal || newVal === '-' || newVal === 'N/A' || newVal === '待确认') {
                    if (oldVal && oldVal !== '-' && oldVal !== 'N/A' && oldVal !== '待确认') {
                        merged[field] = oldVal;
                        preservedCount++;
                    }
                }
            });

            if (preservedCount > 0) {
                merged._preservedFields = preservedCount;
            }

            return merged;
        });
    }

    // 创建旧数据映射表
    const oldDataMap = new Map();
    oldData.forEach(item => {
        const num = String(item.activityNumber || item['活动编号'] || '');
        if (num) {
            oldDataMap.set(num, item);
        }
    });

    // 应用智能合并
    const finalData = smartMerge(mappedData, oldDataMap);

    // 统计保留的字段数量
    const totalPreserved = finalData.reduce((sum, item) => sum + (item._preservedFields || 0), 0);
    if (totalPreserved > 0) {
        log(`💡 智能合并: Excel 中的 ${totalPreserved} 个空值字段已保留后台原数据`, 'info');
    }

    try {
        // 删除临时字段
        const cleanData = finalData.map(({ _preservedFields, ...rest }) => rest);

        fs.writeFileSync(JSON_FILE, JSON.stringify(cleanData, null, 2), 'utf8');
        log(`✅ 数据已保存到: ${JSON_FILE}`);

        // 更新数据版本号，触发前端刷新
        const version = {
            version: Date.now(),
            timestamp: new Date().toISOString(),
            count: cleanData.length
        };
        const versionFile = path.join(__dirname, '../data/version.json');
        fs.writeFileSync(versionFile, JSON.stringify(version, null, 2), 'utf8');
        log(`✅ 数据版本已更新: ${version.version}`);
        log(`💡 前端将在5秒内自动刷新`);
    } catch (error) {
        log(`❌ 保存失败: ${error.message}`, 'error');
        process.exit(1);
    }

    // 步骤8: 分类统计
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('步骤8: 分类统计');

    const categories = {};
    mappedData.forEach(item => {
        const cat = item.category || '未分类';
        categories[cat] = (categories[cat] || 0) + 1;
    });

    log('📊 分类分布:');
    Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
            log(`   ${cat}: ${count} 个`);
        });

    // 保存日志
    const logContent = logs.join('\n');
    fs.writeFileSync(logFile, logContent, 'utf8');
    log(`\n📝 详细日志已保存: ${logFile}`);

    // 完成
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('✨ 导入完成！');
    log(`\n📊 导入摘要（基于活动编号去重）:`);
    log(`   总记录: ${mappedData.length} 条`);
    log(`   新增: ${added.length} 条`);
    log(`   删除: ${removed.length} 条`);
    log(`   更新: ${updated.length} 条（有字段变更）`);
    if (unchanged.length > 0) {
        log(`   未变更: ${unchanged.length} 条（内容相同）`);
    }
    log(`   备份: ${path.basename(backupFile)}`);

    log(`\n💡 提示:`);
    log(`   - 相同活动编号的记录已自动更新为Excel中的最新数据`);
    log(`   - Excel 空值会覆盖后台数据（建议在导入前检查Excel）`);
    log(`   - 详细变更日志已保存，可查看具体哪些字段发生了变化`);

} catch (error) {
    log(`\n❌ 导入失败: ${error.message}`, 'error');
    log(error.stack, 'error');

    // 保存错误日志
    const errorLogContent = logs.join('\n');
    fs.writeFileSync(logFile, errorLogContent, 'utf8');
    log(`\n📝 错误日志已保存: ${logFile}`);

    process.exit(1);
}
