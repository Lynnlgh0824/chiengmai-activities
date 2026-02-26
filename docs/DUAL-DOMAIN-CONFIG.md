# 双域名配置方案

## 域名配置

### 主域名（全球）
- **域名**: `gocnx.com`
- **目标用户**: 全球用户
- **搜索引擎**: Google, Bing, Yahoo
- **SEO 优化**: 英文关键词为主

### 辅助域名（中国）
- **域名**: `gocnx.cn`
- **目标用户**: 中国用户
- **搜索引擎**: 百度, 搜狗, 360
- **SEO 优化**: 中文关键词为主

## Vercel 配置步骤

### 1. 添加域名到 Vercel

```bash
# 在 Vercel 控制台
项目设置 → Domains → Add Domain

# 添加两个域名
gocnx.com
www.gocnx.com
gocnx.cn
www.gocnx.cn
```

### 2. 配置 DNS 记录

**在域名注册商（如 Namecheap）配置：**

```
# gocnx.com
A Record: @ → 76.76.21.21 (Vercel)
CNAME: www → gocnx.vercel.app

# gocnx.cn
A Record: @ → 76.76.21.21 (Vercel)
CNAME: www → gocnx.vercel.app
```

### 3. 等待生效

- SSL 证书自动生成：1-24小时
- DNS 全球生效：1-48小时
- 完成后两个域名都可访问

## 代码配置

### 自动检测用户地区并重定向（可选）

```javascript
// public/js/geo-redirect.js
// 根据用户位置推荐最佳域名

function detectUserCountry() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 中国时区列表
  const chinaTimezones = [
    'Asia/Shanghai',
    'Asia/Chongqing',
    'Asia/Harbin',
    'Asia/Urumqi'
  ];

  return chinaTimezones.includes(timezone) ? 'CN' : 'OTHER';
}

function suggestDomain() {
  const currentDomain = window.location.hostname;
  const userCountry = detectUserCountry();

  // 如果中国用户访问 .com，提示可以访问 .cn
  if (userCountry === 'CN' && currentDomain === 'gocnx.com') {
    const notification = document.createElement('div');
    notification.className = 'domain-suggestion';
    notification.innerHTML = `
      <p>🇨🇳 检测到您在中国，使用国内域名访问可能更快：</p>
      <a href="https://gocnx.cn">gocnx.cn</a>
    `;
    document.body.prepend(notification);
  }
}

// 页面加载后执行
window.addEventListener('DOMContentLoaded', suggestDomain);
```

### SEO 优化配置

```html
<!-- public/index.html -->
<head>
  <!-- Canonical URL（主域名） -->
  <link rel="canonical" href="https://gocnx.com/">

  <!-- 中文 alternate（中国用户） -->
  <link rel="alternate" hreflang="zh-CN" href="https://gocnx.cn/">
  <link rel="alternate" hreflang="en" href="https://gocnx.com/">

  <!-- Open Graph -->
  <meta property="og:url" content="https://gocnx.com/">
</head>
```

## sitemap.xml 配置

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 主域名 sitemap -->
  <url>
    <loc>https://gocnx.com/</loc>
    <priority>1.0</priority>
  </url>

  <!-- 可以在 sitemap 中包含两个域名 -->
  <url>
    <loc>https://gocnx.cn/</loc>
    <priority>1.0</priority>
  </url>
</urlset>
```

## robots.txt 配置

```
# public/robots.txt
User-agent: *
Allow: /
Disallow: /node_modules/

# 主域名 Sitemap
Sitemap: https://gocnx.com/sitemap.xml

# 中国域名 Sitemap
Sitemap: https://gocnx.cn/sitemap.xml
```

## 百度和 Google 验证

### 百度站长平台（.cn 域名）
```html
<meta name="baidu-site-verification" content="codeva-pRjdEjCKGZ" />
```

### Google Search Console（.com 域名）
```html
<meta name="google-site-verification" content="Bam11WyFHNtbFU1qESdh0G2fNDOSu7zPJoTS8Mq3Cpc" />
```

## 域名购买建议

### 推荐域名组合

| 组合 | 域名1 | 域名2 | 总成本 |
|------|-------|-------|--------|
| **方案A** | gocnx.com | gocnx.cn | $25-35/年 |
| **方案B** | gocnx.com | gocnx.asia | $20-30/年 |
| **方案C** | chiangmai-activities.com | gocnx.cn | $25-35/年 |

### 购买步骤

1. **访问 Namecheap**
   ```
   https://www.namecheap.com
   ```

2. **搜索并购买域名**
   ```
   搜索: gocnx.com → 加入购物车
   搜索: gocnx.cn → 加入购物车
   结算: $25-35
   ```

3. **配置 DNS**
   - 在 Namecheap 管理 DNS
   - 添加 A 记录指向 Vercel
   - 添加 CNAME 记录

4. **在 Vercel 添加域名**
   - 项目设置 → Domains
   - 分别添加两个域名
   - 等待自动配置 SSL

## 监控和分析

### Google Analytics 配置

```javascript
// 区分不同域名的流量
gtag('config', 'GA_MEASUREMENT_ID', {
  'custom_map': {'dimension1': 'domain'}
});

// 发送域名维度
gtag('event', 'page_view', {
  'domain': window.location.hostname
});
```

### 数据分析

```javascript
// 可以分别查看：
// - gocnx.com 的流量（海外）
// - gocnx.cn 的流量（中国）
// - 用户行为差异
// - 转化率对比
```

## 实施时间表

### 第1天
- ✅ 购买两个域名（$25-35）
- ✅ 在 Vercel 添加域名
- ✅ 配置 DNS 记录

### 第2-3天
- ⏳ 等待 SSL 证书生成
- ⏳ 等待 DNS 全球生效
- ✅ 测试两个域名访问

### 第4-7天
- ✅ 提交 sitemap 到 Google
- ✅ 提交 sitemap 到百度
- ✅ 配置 Analytics 分域名统计

### 第30天
- 📊 分析两个域名流量
- 📈 优化各地区 SEO 策略

## 成本收益分析

### 投资
```
域名费用: $25-35/年
Vercel: $0（已有）
总成本: $25-35/年
```

### 收益
```
✅ 海外用户体验优化
✅ 中国用户体验优化
✅ SEO 效果提升
✅ 品牌形象提升
✅ 数据分析更精准
✅ 市场定位更清晰
```

### ROI
```
投资: $35
收益: 无限（品牌价值 + 用户体验）
回报率: ∞
```

## 总结

### 为什么推荐双域名？

1. **用户体验最佳**
   - 海外用户用 .com
   - 中国用户用 .cn
   - 各自都是最佳体验

2. **SEO 效果最好**
   - Google 优化 .com
   - 百度优化 .cn
   - 双向流量获取

3. **品牌形象专业**
   - 国际化品牌形象
   - 本土化服务体验
   - 提升用户信任

4. **数据洞察精准**
   - 分域名统计流量
   - 分析地区用户行为
   - 优化市场策略

### 最终推荐

**方案 A：双域名（最佳）**
```
gocnx.com + gocnx.cn = $25-35/年
```

**立即行动：**
1. 访问 Namecheap.com
2. 购买两个域名
3. 配置到 Vercel
4. 48小时后全部完成！

---

**准备好了吗？需要我提供详细的购买步骤吗？**
