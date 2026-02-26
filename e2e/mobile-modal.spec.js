import { test, expect } from '@playwright/test'

/**
 * 移动端活动详情弹窗测试
 * 参考: main-page.spec.js, admin-page.spec.js
 *
 * 测试场景：
 * 1. 移动端点击活动卡片
 * 2. 验证弹窗显示
 * 3. 检查文本换行
 * 4. 验证弹窗居中
 * 5. 测试关闭功能
 */

test.describe('清迈指南 - 移动端活动详情弹窗', () => {
  test.beforeEach(async ({ page }) => {
    // 设置移动端 viewport (iPhone 14 Pro)
    await page.setViewportSize({ width: 393, height: 852 })

    // 访问主页
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
  })

  test('应该能在移动端点击活动卡片并显示详情弹窗', async ({ page }) => {
    // 收集错误
    const errors = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    console.log('📱 开始移动端弹窗测试...\n')

    // 查找并点击活动卡片
    const activityCard = page.locator('.activity-card').first()
    await expect(activityCard).toBeVisible()

    console.log('✅ 找到活动卡片')

    // 点击活动卡片
    await activityCard.click()
    await page.waitForTimeout(1000)

    console.log('👆 已点击活动卡片')

    // 验证弹窗显示
    const modalOverlay = page.locator('.modal-overlay').or(page.locator('.modal'))
    await expect(modalOverlay.first()).toBeVisible()

    console.log('✅ 弹窗已显示')

    // 截图
    await page.screenshot({
      path: 'test-results/mobile/modal-display.png',
      fullPage: true
    })

    // 检查弹窗内容
    const modalInfo = await page.evaluate(() => {
      const modal = document.querySelector('.modal') || document.querySelector('.modal-overlay')
      if (!modal) return null

      const rect = modal.getBoundingClientRect()
      const styles = window.getComputedStyle(modal)

      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        zIndex: styles.zIndex,
        position: styles.position,
        visible: modal.offsetParent !== null
      }
    })

    console.log('\n📊 弹窗信息:')
    console.log(`  尺寸: ${modalInfo.width}x${modalInfo.height}`)
    console.log(`  位置: top=${modalInfo.top}, left=${modalInfo.left}`)
    console.log(`  z-index: ${modalInfo.zIndex}`)
    console.log(`  可见: ${modalInfo.visible}`)

    // 验证弹窗居中（允许误差）
    const viewportWidth = 393
    const centerX = modalInfo.left + modalInfo.width / 2
    const isCentered = Math.abs(centerX - viewportWidth / 2) < 50

    console.log(`\n📍 居中检查: ${isCentered ? '✅' : '❌'}`)

    // 检查文本换行
    const textCheck = await page.evaluate(() => {
      const modal = document.querySelector('.modal')
      if (!modal) return null

      const textElements = modal.querySelectorAll('.info-text > div, .section-content')
      const results = []

      textElements.forEach((el, idx) => {
        const styles = window.getComputedStyle(el)
        results.push({
          index: idx,
          wordBreak: styles.wordBreak,
          overflowWrap: styles.overflowWrap
        })
      })

      return results
    })

    console.log('\n📝 文本换行检查:')
    textCheck.forEach(item => {
      const ok = item.wordBreak === 'break-word' || item.wordBreak === 'break-all'
      console.log(`  [${item.index}] ${ok ? '✅' : '❌'} word-break: ${item.wordBreak}`)
    })

    // 测试关闭按钮
    const closeBtn = page.locator('.modal-close').first()
    if (await closeBtn.isVisible()) {
      await closeBtn.click()
      await page.waitForTimeout(500)

      const modalVisible = await modalOverlay.first().isVisible().catch(() => false)
      console.log(`\n🔘 关闭功能: ${modalVisible ? '❌ 失败' : '✅ 成功'}`)
    }

    // 报告错误
    if (errors.length > 0) {
      console.log('\n⚠️  控制台错误:')
      errors.forEach(err => console.log(`  - ${err}`))
    }

    console.log('\n✅ 移动端测试完成!')
  })

  test('应该检查弹窗文本换行和布局', async ({ page }) => {
    // 点击活动卡片
    const activityCard = page.locator('.activity-card').first()
    await activityCard.click()
    await page.waitForTimeout(1000)

    // 详细检查文本换行
    const textAnalysis = await page.evaluate(() => {
      const modal = document.querySelector('.modal')
      if (!modal) return null

      const containers = modal.querySelectorAll('.info-text > div, .section-content, .modal-description')
      const results = []

      containers.forEach((el, idx) => {
        const styles = window.getComputedStyle(el)
        const text = el.textContent?.trim() || ''

        results.push({
          index: idx,
          className: el.className,
          wordBreak: styles.wordBreak,
          overflowWrap: styles.overflowWrap,
          lineClamp: styles.webkitLineClamp,
          textLength: text.length,
          hasLongText: text.length > 30
        })
      })

      return results
    })

    console.log('\n📝 文本换行详细分析:')
    console.log('='.repeat(80))

    let allGood = true
    textAnalysis.forEach(item => {
      if (item.hasLongText) {
        const hasProperBreak = item.wordBreak === 'break-word' ||
                              item.wordBreak === 'break-all' ||
                              item.overflowWrap === 'break-word'

        console.log(`${hasProperBreak ? '✅' : '❌'} [${item.index}]`)
        console.log(`   word-break: ${item.wordBreak}`)
        console.log(`   overflow-wrap: ${item.overflowWrap}`)
        console.log(`   文本长度: ${item.textLength}`)

        if (!hasProperBreak) {
          allGood = false
        }
      }
    })

    console.log('='.repeat(80))

    // 截图
    await page.screenshot({
      path: 'test-results/mobile/text-wrapping-check.png',
      fullPage: true
    })

    expect(allGood).toBe(true)
  })

  test('应该能在多个移动设备上正常显示', async ({ page }) => {
    const mobileDevices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 14 Pro', width: 393, height: 852 }
    ]

    for (const device of mobileDevices) {
      console.log(`\n📱 测试设备: ${device.name} (${device.width}x${device.height})`)

      // 设置viewport
      await page.setViewportSize({ width: device.width, height: device.height })
      await page.goto('http://localhost:5173')
      await page.waitForTimeout(2000)

      // 点击活动卡片
      const activityCard = page.locator('.activity-card').first()
      await expect(activityCard).toBeVisible()
      await activityCard.click()
      await page.waitForTimeout(1000)

      // 验证弹窗
      const modal = page.locator('.modal, .modal-overlay').first()
      await expect(modal).toBeVisible()

      console.log(`  ✅ 弹窗正常显示`)

      // 截图
      await page.screenshot({
        path: `test-results/mobile/modal-${device.name.toLowerCase().replace(/\s/g, '-')}.png`,
        fullPage: true
      })

      // 关闭弹窗
      const closeBtn = page.locator('.modal-close').first()
      if (await closeBtn.isVisible()) {
        await closeBtn.click()
        await page.waitForTimeout(500)
      }
    }

    console.log('\n✅ 多设备测试完成!')
  })
})

test.describe('清迈指南 - 移动端性能和体验', () => {
  test('应该快速响应点击', async ({ page }) => {
    // 设置移动端 viewport
    await page.setViewportSize({ width: 393, height: 852 })
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(2000)

    // 测试响应时间
    const clickStart = Date.now()
    const activityCard = page.locator('.activity-card').first()
    await activityCard.click()

    // 等待弹窗
    await page.waitForSelector('.modal, .modal-overlay', { timeout: 5000 })
    const clickEnd = Date.now()

    const responseTime = clickEnd - clickStart
    console.log(`\n⚡ 弹窗响应时间: ${responseTime}ms`)

    // 应该小于500ms
    expect(responseTime).toBeLessThan(500)

    console.log('✅ 响应时间符合预期')
  })

  test('应该支持触摸滚动', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 })
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(2000)

    // 点击活动卡片
    const activityCard = page.locator('.activity-card').first()
    await activityCard.click()
    await page.waitForTimeout(1000)

    // 检查滚动
    const hasScroll = await page.evaluate(() => {
      const modal = document.querySelector('.modal')
      if (!modal) return false
      const styles = window.getComputedStyle(modal)
      return styles.overflowY === 'auto' || styles.overflowY === 'scroll'
    })

    console.log(`\n📜 滚动支持: ${hasScroll ? '✅' : '❌'}`)

    // 检查内容高度
    const contentHeight = await page.evaluate(() => {
      const modal = document.querySelector('.modal')
      return modal ? modal.scrollHeight : 0
    })

    console.log(`📏 弹窗内容高度: ${contentHeight}px`)

    // 截图
    await page.screenshot({
      path: 'test-results/mobile/scroll-support.png',
      fullPage: true
    })

    expect(hasScroll).toBe(true)
  })
})
