# 🚀 Excel自动同步 - 快速开始指南

## ✨ 已准备好的功能

你的项目已经配置好了Excel自动同步系统！所有脚本都已就绪。

---

## 📋 一、Excel数据同步命令

### 1.1 从Excel导入到后台 ⭐

```bash
# 手动导入Excel数据
npm run import-excel
```

**功能：**
- 读取 `清迈活动数据.xlsx`
- 自动转换为JSON格式
- 保存到 `data/items.json`
- 创建备份到 `backups/` 目录
- 生成日志到 `logs/` 目录

---

### 1.2 从后台导出到Excel

```bash
# 导出后台数据到Excel
npm run export-to-excel
```

**功能：**
- 读取 `data/items.json`
- 生成Excel文件
- 包含时间戳，避免覆盖

---

### 1.3 自动监听Excel变化 🎯（推荐）

```bash
# 方案A：前台运行（可以看到日志）
npm run watch-excel

# 方案B：使用便捷脚本
bash start-excel-sync.sh
```

**功能：**
- 实时监听Excel文件变化
- 自动触发导入
- 无需手动操作

**工作流程：**
```
1. 启动监听: npm run watch-excel
2. 打开Excel文件，编辑数据
3. 保存Excel
4. 自动导入到后台 ✅
5. 刷新前端页面，看到新数据 ✅
```

---

## 🎯 二、快速工作流程

### 日常使用流程

```bash
# 终端1：启动前端和后端
npm run dev

# 终端2：启动Excel监听
npm run watch-excel

# 终端3：编辑Excel
# 打开 清迈活动数据.xlsx，编辑并保存
# 自动导入！刷新浏览器即可看到变化
```

---

## 🛠️ 三、其他实用命令

### 添加活动编号

```bash
# 为所有活动添加编号（0001, 0002...）
npm run add-numbers
```

### 添加唯一ID

```bash
# 为所有活动添加唯一ID
npm run add-ids
```

---

## 📂 四、文件说明

### Excel文件
```
清迈活动数据.xlsx          # 主数据文件
```

### 数据文件
```
data/items.json            # 后台数据（JSON格式）
```

### 备份文件
```
backups/
  ├── backup-2026-01-26.xlsx         # Excel备份
  ├── items-2026-01-26.json         # JSON备份
  └── ...
```

### 日志文件
```
logs/
  ├── import-2026-01-26.log         # 导入日志
  └── ...
```

---

## ⚠️ 五、注意事项

### 5.1 Excel文件格式

确保Excel文件包含以下列（18列标准格式）：

1. id - 唯一标识
2. activityNumber - 活动编号
3. title - 活动名称
4. category - 分类
5. location - 地点
6. price - 价格
7. time - 时间
8. duration - 时长
9. timeInfo - 时间信息
10. weekdays - 星期（逗号分隔）
11. description - 描述
12. organizer - 组织者
13. contact - 联系方式
14. frequency - 频率
15. source.url - 来源链接
16. sortOrder - 排序
17. createdAt - 创建时间
18. updatedAt - 更新时间

### 5.2 备份管理

- 每次导入前自动备份
- 备份文件包含时间戳
- 建议定期清理旧备份（保留最近3-5个）

### 5.3 数据验证

导入时会自动：
- 验证必填字段（title, category）
- 验证分类枚举值
- 验证价格格式
- 跳过无效数据或使用默认值

---

## 🔧 六、故障排除

### 问题1：监听不工作

```bash
# 检查文件是否存在
ls -la 清迈活动数据.xlsx

# 检查文件权限
chmod 644 清迈活动数据.xlsx

# 重新启动监听
npm run watch-excel
```

### 问题2：导入失败

```bash
# 查看日志
cat logs/import-*.log | tail -50

# 检查JSON文件
cat data/items.json | jq .
```

### 问题3：前端看不到新数据

```bash
# 1. 检查JSON是否更新
cat data/items.json | jq '. | length'

# 2. 重启后端服务器
# Ctrl+C 停止，然后
npm start

# 3. 刷新浏览器
# 硬刷新: Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
```

---

## 🚀 七、高级用法

### 后台运行监听服务

```bash
# 使用 nohup 在后台运行
nohup npm run watch-excel > excel-sync.log 2>&1 &

# 查看运行状态
ps aux | grep watch-excel

# 停止后台进程
pkill -f watch-excel
```

### 创建桌面快捷方式（Mac）

```bash
# 创建自动化脚本
# 使用 Automator 或 Alfred Workflow
```

---

## 📚 八、相关文档

- [完整Excel同步指南](./EXCEL-SYNC-ANALYSIS.md)
- [导入功能文档](./EXCEL-IMPORT-GUIDE.md)
- [任务清单](./TASKS-TODO.md)

---

## 💡 九、最佳实践

### 推荐工作流程

1. **开始工作**
   ```bash
   # 终端1
   npm run dev

   # 终端2
   npm run watch-excel
   ```

2. **编辑数据**
   - 打开Excel
   - 编辑活动信息
   - 保存文件（Ctrl+S / Cmd+S）

3. **查看结果**
   - 等待自动导入（1-2秒）
   - 刷新浏览器
   - 查看更新后的数据

4. **结束工作**
   - 关闭Excel
   - 停止监听（Ctrl+C）
   - 检查备份文件

---

## ✅ 十、检查清单

### 每次导入后检查

- [ ] 查看导入日志，确认无错误
- [ ] 检查 `data/items.json` 是否更新
- [ ] 刷新前端，验证数据显示正确
- [ ] 检查备份文件是否创建
- [ ] 验证活动数量是否正确

---

## 🎉 立即开始

```bash
# 1. 确保Excel文件存在
ls 清迈活动数据.xlsx

# 2. 启动监听
npm run watch-excel

# 3. 编辑Excel并保存
# 自动导入！✨
```

---

**需要帮助？** 查看日志文件或运行 `npm run import-excel` 查看详细输出。
