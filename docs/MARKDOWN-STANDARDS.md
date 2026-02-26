# Markdown 文件格式规范

**版本**: v1.0
**创建时间**: 2026-01-29
**目的**: 统一项目的Markdown文件格式，确保多人协作时格式一致

---

## 📋 目录

1. [基本原则](#基本原则)
2. [文件命名规范](#文件命名规范)
3. [标题层级规范](#标题层级规范)
4. [换行和段落规范](#换行和段落规范)
5. [链接格式规范](#链接格式规范)
6. [图片处理规范](#图片处理规范)
7. [代码块规范](#代码块规范)
8. [列表规范](#列表规范)
9. [表格规范](#表格规范)
10. [格式检查工具](#格式检查工具)

---

## 基本原则

### ✅ 应该做的

- **统一使用UTF-8编码**: 确保所有MD文件使用UTF-8编码
- **使用LF换行符**: Unix风格换行（\n），而非Windows风格（\r\n）
- **保持代码简洁**: 避免不必要的格式化和嵌套
- **语义化标题**: 标题应该反映内容结构，而非样式
- **文档版本化**: 重要文档应包含版本号和更新日期

### ❌ 不应该做的

- **不要提交临时文件**: 草稿、测试文件应被.gitignore忽略
- **不要嵌入二进制内容**: 图片应使用外部链接
- **不要过度嵌套**: 标题层级不超过4级
- **不要混合换行风格**: 统一使用LF
- **不要使用HTML标签**: 除非Markdown不支持的特性

---

## 文件命名规范

### 命名规则

#### ✅ 推荐的命名

```bash
# 使用小写字母和连字符
readme.md
api-documentation.md
git-security-guide.md
markdown-standards.md

# 特殊文件可大写（仅README等）
README.md
CHANGELOG.md
CONTRIBUTING.md
LICENSE.md
```

#### ❌ 避免的命名

```bash
# 不要使用中文（除非是文档内容需要）
中文文档.md  ❌

# 不要使用空格
my document.md  ❌

# 不要使用特殊字符
file@name.md  ❌
my#file.md  ❌
```

### 临时文件命名

以下命名模式会被.gitignore自动忽略：

```bash
*.tmp.md          # 临时文件
*.draft.md        # 草稿文件
*测试*.md          # 测试文件
*草稿*.md          # 草稿文件
*草*.md            # 草稿文件
*.md.old          # 备份文件
*备份*.md          # 备份文件
*本地*.md          # 本地笔记
```

---

## 标题层级规范

### 层级结构

```markdown
# 一级标题（H1）- 文档标题

每篇文档只有一个一级标题

## 二级标题（H2）- 主要章节

### 三级标题（H3）- 子章节

#### 四级标题（H4）- 小节

##### 五级标题（H5）- 详细说明（尽量避免）

###### 六级标题（H6）- 极少使用（不推荐）
```

### 使用规范

#### ✅ 正确示例

```markdown
# 项目API文档

## 认证接口

### 登录接口

#### 请求参数

##### 用户名

格式：字符串
长度：3-20字符
```

#### ❌ 错误示例

```markdown
# 标题1

# 标题2  ❌ 不要跳级使用

### 标题3  ❌ 不要在没有H2的情况下使用H3
```

### 标题格式要求

1. **标题前后空行**: 标题前后必须有空行
   ```markdown
   上一段内容

   ## 下一级标题

   下一部分内容
   ```

2. **标题结尾不要加标点**: 标题行末尾不加句号、冒号等
   ```markdown
   ## 简介。  ❌ 错误
   ## 简介   ✅ 正确
   ```

3. **使用空格**: #符号和文字之间要有空格
   ```markdown
   ##标题  ❌ 错误
   ## 标题  ✅ 正确
   ```

---

## 换行和段落规范

### 段落换行

#### ✅ 推荐做法

```markdown
这是一段文字。

这是另一段文字，段落之间用空行分隔。
```

#### ❌ 避免的做法

```markdown
这是一段文字。
没有空行的"新段落"实际上还是同一段落。❌
```

### 行尾换行

- **建议每行不超过80-100字符**: 方便在终端查看
- **不要在行尾使用硬换行**: 让编辑器自动换行
- **段落之间用空行分隔**: 一个空行即可

```markdown
✅ 正确的段落格式

这是一段较长的文字，虽然它很长，但我们不在行尾手动添加换行符，
而是让编辑器自动处理换行。这样在版本控制时更容易看出实际的修改。

这是新的一段，与上面用空行分隔。
```

### 列表换行

```markdown
✅ 列表项可以短：

- 第一项
- 第二项
- 第三项

✅ 也可以长（子内容缩进）：

- 第一项
  这是第一项的详细说明，缩进2个空格。

- 第二项
  这是第二项的详细说明。
```

---

## 链接格式规范

### 内部链接

#### ✅ 推荐格式

```markdown
# 使用相对路径
查看 [API文档](docs/API.md) 了解详情。

# 使用锚点链接
跳转到 [认证接口](#认证接口) 章节。

# 组合使用
查看 [Git指南中的安全部分](docs/GIT-SECURITY-GUIDE.md#安全检查)
```

#### ❌ 避免的格式

```markdown
# 不要使用绝对路径（除非必要）
查看 [/Users/username/project/docs/API.md]  ❌

# 不要混合大小写（系统差异）
查看 [docs\Api.md]  ❌ 应该是 API.md
```

### 外部链接

```markdown
# GitHub链接
访问 [GitHub](https://github.com/Lynnlgh0824/chiangmai-activities)

# 带标题的链接
[Markdown Guide](https://www.markdownguide.org/ "Markdown官方指南")

# 邮箱链接
联系作者：<author@example.com>
```

### 图片链接

```markdown
# 使用外部图床
![项目架构图](https://your-cdn.com/architecture.png)

# 或使用GitHub仓库
![Logo](https://raw.githubusercontent.com/user/repo/main/logo.png)
```

---

## 图片处理规范

### ⚠️ 重要原则

**不要在MD文件中嵌入二进制图片内容！**

### 为什么不应该嵌入图片

1. **仓库体积膨胀**: 每个图片会变成Base64编码，体积增加约33%
2. **版本控制困难**: 图片的每个像素变化都会产生diff
3. **性能问题**: Git操作变慢，克隆时间增加
4. **可读性差**: Base64字符串在编辑器中难以阅读
5. **无法预览**: 很多Markdown查看器无法正确显示嵌入的图片

### ✅ 正确做法

#### 1. 使用图床服务

```markdown
<!-- ✅ 推荐：使用外部图床 -->
![架构图](https://oss.example.com/images/architecture.png)
![流程图](https://img.shields.io/badge/status-active-green)
```

#### 2. 使用GitHub托管

```markdown
<!-- ✅ 推荐：使用GitHub raw链接 -->
![Logo](https://raw.githubusercontent.com/user/repo/main/public/logo.png)

<!-- 或使用相对路径（仅适用于同一仓库） -->
![Logo](../public/logo.png)
```

#### 3. 使用专门的图片目录

```markdown
项目结构：
public/
  images/
    architecture.png
    workflow.png

docs/
  README.md

在MD中引用：
![架构图](../public/images/architecture.png)
```

### ❌ 错误做法

```markdown
<!-- ❌ 不要这样做：嵌入Base64图片 -->
![图片](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)
```

### 图片格式建议

| 用途 | 推荐格式 | 说明 |
|------|---------|------|
| 照片/截图 | PNG | 无损压缩，质量高 |
| 图标/Logo | SVG | 矢量图，可缩放 |
| 简单图形 | SVG | 体积小，清晰 |
| 复杂图片 | JPG | 有损压缩，体积小 |

### 图片尺寸控制

```markdown
<!-- HTML方式控制尺寸 -->
<img src="image.png" width="300" height="200" />

<!-- 或在Markdown中使用相对链接 -->
![图片](image.png){: width="300px"}
```

---

## 代码块规范

### 代码块标记

#### ✅ 正确示例

```markdown
# 指定语言以启用语法高亮

\```javascript
function hello() {
  console.log("Hello, World!");
}
\```

# Bash命令

\```bash
npm install
npm run dev
\```

# JSON

\```json
{
  "name": "project",
  "version": "1.0.0"
}
\```
```

#### ❌ 错误示例

```markdown
# 不要使用缩进来表示代码块

    function hello() {  // ❌ 不推荐
      console.log("Hello");
    }

# 应该使用代码块标记

```javascript
function hello() {  // ✅ 正确
  console.log("Hello");
}
```

### 行内代码

```markdown
使用反引号标记行内代码：`npm install`

如果代码中包含反引号，使用双反引号：
`` `代码包含反引号` ``
```

### 代码块语言支持

常用语言标识：
- `javascript` / `js`
- `typescript` / `ts`
- `python` / `py`
- `bash` / `sh`
- `json`
- `yaml` / `yml`
- `html`
- `css`
- `markdown` / `md`

---

## 列表规范

### 无序列表

```markdown
# ✅ 推荐：使用连字符

- 第一项
- 第二项
- 第三项

# 也支持使用星号或加号（但要统一）

* 第一项
* 第二项

+ 第一项
+ 第二项
```

### 有序列表

```markdown
1. 第一项
2. 第二项
3. 第三项

# 嵌套列表

1. 第一项
   - 子项1
   - 子项2
2. 第二项
```

### 任务列表

```markdown
- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 待办事项

# 嵌套任务

- [ ] 主任务
  - [x] 子任务1
  - [ ] 子任务2
```

### 列表缩进

```markdown
# 子列表缩进2个空格

- 主项
  - 子项
    - 次子项

# 或缩进4个空格（更清晰）

- 主项
    - 子项
        - 次子项
```

---

## 表格规范

### 基本格式

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
```

### 对齐方式

```markdown
| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 数据1  | 数据2 |  数据3 |
| 数据4  | 数据5 |  数据6 |
```

### 表格最佳实践

1. **保持简洁**: 表格不宜过宽，考虑移动端显示
2. **使用转义**: 竖线需要转义 `\|`
3. **空格对齐**: 保持代码可读性

```markdown
| API | 方法 | 描述 |
|-----|------|------|
| /api/users | GET | 获取用户列表 |
| /api/users/:id | GET | 获取单个用户 |
```

---

## 格式检查工具

### 自动检查脚本

项目提供了MD格式检查脚本：

```bash
# 检查所有MD文件
./scripts/check-markdown.sh

# 检查单个文件
./scripts/check-markdown.sh docs/README.md
```

### 检查项目

脚本会检查：
- ✅ 文件编码是否为UTF-8
- ✅ 换行符是否为LF
- ✅ 是否包含嵌入式Base64图片
- ✅ 标题层级是否正确
- ✅ 链接是否有效
- ✅ 表格格式是否正确

### 格式化工具

推荐使用VSCode扩展：
- **Markdown All in One**: 格式化和预览
- **markdownlint**: 语法检查
- **Code Spell Checker**: 拼写检查

---

## 最佳实践示例

### 完整文档模板

```markdown
# 文档标题

**版本**: v1.0
**创建时间**: 2026-01-29
**作者**: Your Name
**目的**: 文档的简要说明

---

## 📋 目录

1. [章节1](#章节1)
2. [章节2](#章节2)

---

## 章节1

章节介绍文字。

### 子章节

详细内容。

#### 代码示例

```bash
npm install
```

---

## 章节2

更多内容。

---

## 参考资料

- [相关文档](link)
- [外部资源](link)

---

**更新历史**:
- 2026-01-29: 初始版本
```

---

## 常见问题

### Q: 如何处理中文文件名？

A: 建议避免使用中文文件名，因为：
1. 不同系统兼容性问题
2. URL编码问题
3. 命令行操作不便

**替代方案**：
- 使用拼音或英文命名
- 在文档内容中使用中文标题

### Q: 如何处理大量图片？

A: 推荐：
1. 上传到图床服务（阿里云OSS、GitHub等）
2. 在MD中只保留链接
3. 图片按功能分类存储

### Q: 如何确保团队格式一致？

A: 建议：
1. 使用本文档作为团队规范
2. 集成markdownlint到CI/CD
3. 定期代码审查时检查MD格式
4. 使用pre-commit hook自动检查

---

## 相关文档

- [docs/GIT-BEST-PRACTICES.md](docs/GIT-BEST-PRACTICES.md) - Git最佳实践
- [docs/GIT-HOOKS-GUIDE.md](docs/GIT-HOOKS-GUIDE.md) - Git Hooks使用指南
- [.gitignore](../.gitignore) - Git忽略规则

---

**规范版本**: v1.0
**最后更新**: 2026-01-29
**维护者**: 项目团队
