#!/usr/bin/env node

/**
 * 🚀 智能自动导入系统
 * 基于学习到的最佳实践优化
 *
 * 核心原则：一个数据也不能错
 * 使用统一的验证模块（validators.mjs）
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

const CONFIG = {
  excelFile: path.join(__dirname, '../清迈活动数据.xlsx'),
  jsonFile: path.join(__dirname, '../data/items.json'),
  snapshotDir: path.join(__dirname, '../snapshots'),
  logDir: path.join(__dirname, '../logs'),
  errorDir: path.join(__dirname, '../errors')
};

// 创建必要的目录
[CONFIG.snapshotDir, CONFIG.errorDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// =====================================================
// 快照管理
// =====================================================

/**
 * 创建快照
 */
function createSnapshot() {
  const timestamp = new Date().toISOString();
  const data = JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf8'));

  const snapshot = {
    timestamp,
    filename: path.basename(CONFIG.excelFile),
    activityCount: data.length,
    data: data
  };

  const snapshotFile = path.join(
    CONFIG.snapshotDir,
    `snapshot-${timestamp.replace(/[:.]/g, '-')}.json`
  );

  fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));

  console.log(`✅ 快照已创建: ${path.basename(snapshotFile)}`);

  // 只保留最近10个快照
  cleanOldSnapshots();

  return snapshotFile;
}

/**
 * 清理旧快照
 */
function cleanOldSnapshots(keepCount = 10) {
  const files = fs.readdirSync(CONFIG.snapshotDir)
    .filter(f => f.startsWith('snapshot-'))
    .map(f => ({
      name: f,
      path: path.join(CONFIG.snapshotDir, f),
      time: fs.statSync(path.join(CONFIG.snapshotDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > keepCount) {
    files.slice(keepCount).forEach(file => {
      fs.unlinkSync(file.path);
    });

    console.log(`🗑️  已清理 ${files.length - keepCount} 个旧快照`);
  }
}

/**
 * 列出所有快照
 */
function listSnapshots() {
  const files = fs.readdirSync(CONFIG.snapshotDir)
    .filter(f => f.startsWith('snapshot-'))
    .map(f => {
      const snapshotPath = path.join(CONFIG.snapshotDir, f);
      const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
      return {
        file: f,
        ...snapshot
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return files;
}

/**
 * 回滚到指定快照
 */
function rollbackToSnapshot(snapshotFile) {
  const snapshotPath = path.join(CONFIG.snapshotDir, snapshotFile);
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

  // 1. 恢复JSON数据
  fs.writeFileSync(CONFIG.jsonFile, JSON.stringify(snapshot.data, null, 2));

  // 2. 导出到Excel
  exportToExcel(snapshot.data);

  console.log(`✅ 已回滚到快照: ${snapshot.timestamp}`);
  console.log(`   恢复了 ${snapshot.activityCount} 个活动`);

  return snapshot;
}

// =====================================================
// 错误报告生成
// =====================================================

/**
 * 生成错误报告
 */
function generateErrorReport(errors, successCount) {
  const report = {
    timestamp: new Date().toISOString(),
    filename: path.basename(CONFIG.excelFile),
    summary: {
      total: errors.length + successCount,
      success: successCount,
      failed: errors.length
    },
    errors: errors.map(err => ({
      row: err.itemCount || '?',
      title: err.item || '未知活动',
      field: err.fieldName || err.field || '未知字段',
      error: err.error || '验证失败',
      suggestion: err.suggestion || ''
    }))
  };

  const errorFile = path.join(
    CONFIG.errorDir,
    `import-error-${Date.now()}.json`
  );

  fs.writeFileSync(errorFile, JSON.stringify(report, null, 2));

  console.log(`\n📋 错误报告已生成: ${errorFile}`);
  console.log(`   总数: ${report.summary.total}`);
  console.log(`   成功: ${report.summary.success}`);
  console.log(`   失败: ${report.summary.failed}`);

  return errorFile;
}

// =====================================================
// 增强的自动导入
// =====================================================

/**
 * 智能自动导入（带验证、冲突检测、快照）
 */
function smartAutoImport() {
  const logs = [];

  function log(msg, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${msg}`;
    logs.push(logEntry);
    console.log(logEntry);
  }

  function saveLog() {
    const logFile = path.join(
      CONFIG.logDir,
      `auto-import-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
    );
    fs.writeFileSync(logFile, logs.join('\n'));
    console.log(`\n📝 详细日志: ${logFile}`);
  }

  try {
    log('═══════════════════════════════════════════');
    log('🚀 开始智能自动导入（使用统一验证模块）');
    log('═══════════════════════════════════════════\n');

    // 步骤1: 创建快照
    log('步骤1: 创建安全快照');
    const snapshotFile = createSnapshot();

    // 步骤2: 读取Excel
    log('\n步骤2: 读取Excel文件');
    const workbook = XLSX.readFile(CONFIG.excelFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    log(`✅ 读取到 ${rawData.length} 行数据`);

    // 步骤3: 数据映射
    log('\n步骤3: 数据映射');
    let mappedData = rawData.map((row, index) => {
      // 处理星期字段：将字符串转为数组
      let weekdays = row['星期'];
      if (typeof weekdays === 'string') {
        // 支持多种分隔符：逗号、中文逗号、顿号
        weekdays = weekdays.split(/[,，、]/).map(d => d.trim()).filter(d => d);
      }

      // 确保weekdays是数组，如果是undefined则设为空数组
      if (!Array.isArray(weekdays)) {
        weekdays = [];
      }

      const item = {
        id: row['活动编号'] || row['id'],  // 使用活动编号作为ID
        activityNumber: row['活动编号'],
        title: row['活动标题'] || row['title'],
        category: row['分类'] || row['category'],
        location: row['地点'] || row['location'],
        price: row['价格'] || row['price'],
        time: row['时间'] || row['time'],
        weekdays: weekdays,
        description: row['描述'] || row['description'] || '',
        // ... 其他字段
      };

      return item;
    });

    // 步骤3.5: 自动生成缺失的活动编号
    log('\n步骤3.5: 检查并自动生成活动编号');
    let autoGeneratedCount = 0;
    const existingData = JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf8'));

    mappedData.forEach((item, index) => {
      if (!item.activityNumber || item.activityNumber.trim() === '') {
        const newNumber = generateActivityNumber(existingData);
        item.activityNumber = newNumber;
        item.id = newNumber;
        existingData.push(item); // 添加到现有数据中，避免重复生成
        autoGeneratedCount++;
        log(`   ✅ 第 ${index + 1} 行自动生成编号: ${newNumber}`);
      }
    });

    if (autoGeneratedCount > 0) {
      log(`💡 自动生成了 ${autoGeneratedCount} 个活动编号`);
    }

    // 步骤4: 数据验证（使用统一验证模块）
    log('\n步骤4: 数据验证（统一验证模块）');
    const errors = [];
    const validData = [];

    mappedData.forEach((item, index) => {
      const validation = validateItem(item, index, {
        existingData: JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf8')),
        currentBatchData: mappedData,
        checkUniqueness: true,
        autoGenerateNumbers: false // 已经在上面处理了
      });

      if (validation.valid) {
        validData.push(item);
      } else {
        // validation.errors is an array of error objects
        errors.push(...validation.errors);
      }
    });

    log(`✅ 验证完成: ${validData.length} 条通过`);

    if (errors.length > 0) {
      log(`⚠️  发现 ${errors.length} 条数据有错误\n`);

      // 显示前5个错误
      errors.slice(0, 5).forEach(err => {
        const itemInfo = err.item || '';
        log(`  第${err.itemCount}行 "${itemInfo}": ${err.fieldName} - ${err.error}`);
      });

      if (errors.length > 5) {
        log(`  ... 还有 ${errors.length - 5} 个错误`);
      }

      // 生成错误报告
      generateErrorReport(errors, 0);

      log('\n❌ 导入失败：发现数据错误');
      log('💡 建议：请根据错误报告修改Excel文件后重试');
      saveLog();

      return { success: false, errors };
    }

    // 步骤5: 读取现有数据
    log('\n步骤5: 读取现有数据');
    const dataForConflict = JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf8'));
    log(`✅ 现有数据: ${dataForConflict.length} 个活动`);

    // 步骤6: 冲突检测（使用统一验证模块）
    log('\n步骤6: 冲突检测');
    const conflicts = detectTimeLocationConflicts(validData, dataForConflict);

    if (conflicts.length > 0) {
      log(`⚠️  发现 ${conflicts.length} 个时间/地点冲突:\n`);

      conflicts.forEach(conf => {
        log(`  冲突: ${conf.message}`);
        log(`    现有: ${conf.existing.title} (${conf.existing.activityNumber})`);
        log(`    导入: ${conf.incoming.title} (${conf.incoming.activityNumber})`);
      });

      log('\n💡 处理策略: 使用导入数据覆盖（最新数据优先）');
    } else {
      log('✅ 未发现冲突');
    }

    // 步骤7: 合并数据（按活动编号）
    log('\n步骤7: 合并数据');
    const activitiesMap = new Map();

    // 先添加现有数据
    dataForConflict.forEach(item => {
      activitiesMap.set(item.activityNumber, item);
    });

    // 新数据覆盖或新增
    let addedCount = 0;
    let updatedCount = 0;

    validData.forEach(item => {
      const num = item.activityNumber;

      if (activitiesMap.has(num)) {
        updatedCount++;
        activitiesMap.set(num, item);  // 覆盖
      } else {
        addedCount++;
        activitiesMap.set(num, item);  // 新增
      }
    });

    const finalData = Array.from(activitiesMap.values())
      .sort((a, b) => parseInt(a.activityNumber) - parseInt(b.activityNumber));

    log(`✅ 合并完成:`);
    log(`   新增: ${addedCount} 个`);
    log(`   更新: ${updatedCount} 个`);
    log(`   总计: ${finalData.length} 个`);

    // 步骤8: 保存数据
    log('\n步骤8: 保存数据');
    fs.writeFileSync(CONFIG.jsonFile, JSON.stringify(finalData, null, 2));
    log('✅ 数据已保存到: data/items.json');

    // 步骤9: 导出到Excel（可选）
    log('\n步骤9: 同步到Excel');
    // exportToExcel(finalData);  // 如果需要同步到Excel
    log('✅ Excel文件未修改（保持原样）');

    log('\n═══════════════════════════════════════════');
    log('✨ 智能自动导入完成！');
    log('═══════════════════════════════════════════\n');

    saveLog();

    return {
      success: true,
      snapshot: snapshotFile,
      addedCount,
      updatedCount,
      finalCount: finalData.length
    };

  } catch (error) {
    log(`❌ 导入失败: ${error.message}`, 'error');
    log(error.stack, 'error');
    saveLog();
    return { success: false, error };
  }
}

// =====================================================
// 导出功能
// =====================================================

function exportToExcel(data) {
  // 简化的导出功能
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '活动数据');

  XLSX.writeFile(workbook, CONFIG.excelFile);
}

// =====================================================
// 主程序
// =====================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 智能自动导入系统（统一验证模块）\n');

  const result = smartAutoImport();

  if (result.success) {
    console.log('\n🎉 导入成功！');
    console.log(`📊 数据统计:`);
    console.log(`   - 总活动数: ${result.finalCount}`);
    console.log(`   - 新增活动: ${result.addedCount}`);
    console.log(`   - 更新活动: ${result.updatedCount}`);
    console.log(`   - 快照文件: ${result.snapshot}`);
  } else {
    console.log('\n❌ 导入失败，请查看错误日志');
  }
}

export {
  smartAutoImport,
  createSnapshot,
  rollbackToSnapshot,
  listSnapshots
};
