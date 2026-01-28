import { test, expect } from '@playwright/test'

/**
 * 日期筛选高亮模式测试
 *
 * 验证功能：
 * 1. 点击日期后，所有7天的格子都应该显示活动（不应该有"今日无活动"）
 * 2. 选中的日期的活动应该有高亮样式（紫色渐变背景）
 * 3. 其他日期的活动正常显示但不高亮
 */

test.describe('日期筛选 - 高亮模式测试', () => {
  test.beforeEach(async ({ page }) => {
    // 监听控制台日志，便于调试
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`[浏览器控制台] ${msg.type()}: ${msg.text()}`)
      }
    })

    // 访问主页
    await page.goto('/')
    // 等待页面加载完成
    await page.waitForTimeout(3000)
  })

  test('兴趣班 Tab - 点击周一应该高亮显示，其他天也显示活动', async ({ page }) => {
    // 1. 切换到"兴趣班" Tab (使用更精确的选择器)
    const interestClassTab = page.locator('.tab-chips .filter-chip:has-text("兴趣班")').first()
    await expect(interestClassTab).toBeVisible()
    await interestClassTab.click()
    await page.waitForTimeout(1000)

    // 2. 点击"周一"日期筛选 (使用day-cell-header)
    const mondayButton = page.locator('.day-cell-header:has-text("周一")')
    await expect(mondayButton).toBeVisible()
    await mondayButton.first().click()
    await page.waitForTimeout(500)

    // 3. 验证：所有7天的格子都不应该显示"今日无活动"
    const dayCells = page.locator('.day-cell')
    const cellCount = await dayCells.count()
    console.log(`📊 找到 ${cellCount} 个日期格子`)

    expect(cellCount, '应该有7个日期格子').toBeGreaterThanOrEqual(7)

    // 检查每个格子
    for (let i = 0; i < Math.min(cellCount, 7); i++) {
      const cell = dayCells.nth(i)
      const text = await cell.textContent()

      // 验证：不应该出现"今日无活动"
      expect(text, `第${i}个格子不应该显示"今日无活动"`).not.toContain('今日无活动')

      // 验证：每个格子应该有活动卡片
      const activityChips = cell.locator('.activity-chip')
      const chipCount = await activityChips.count()
      expect(chipCount, `第${i}个格子应该有活动卡片`).toBeGreaterThan(0)

      console.log(`✅ 格子${i}: 有 ${chipCount} 个活动`)
    }

    // 4. 验证：周一的活动应该有高亮样式
    const highlightedChips = page.locator('.activity-chip').filter({
      has: page.locator('style*="linear-gradient(135deg, #667eea"')
    })
    const highlightedCount = await highlightedChips.count()
    console.log(`🎨 高亮活动数量: ${highlightedCount}`)

    expect(highlightedCount, '应该有高亮的活动').toBeGreaterThan(0)

    // 5. 验证：高亮样式包含紫色渐变
    const hasHighlightStyle = await page.evaluate(() => {
      const highlighted = document.querySelectorAll('.activity-chip')
      for (const chip of highlighted) {
        const style = chip.getAttribute('style') || ''
        if (style.includes('linear-gradient(135deg, #667eea')) {
          return true
        }
      }
      return false
    })

    expect(hasHighlightStyle, '应该找到紫色渐变高亮样式').toBe(true)
  })

  test('市集 Tab - 点击周三应该高亮显示', async ({ page }) => {
    // 1. 切换到"市集" Tab
    const marketTab = page.locator('.tab-chips .filter-chip:has-text("市集")').first()
    await expect(marketTab).toBeVisible()
    await marketTab.click()
    await page.waitForTimeout(1000)

    // 2. 点击"周三"日期筛选
    const wednesdayButton = page.locator('.day-cell-header:has-text("周三")')
    await expect(wednesdayButton).toBeVisible()
    await wednesdayButton.first().click()
    await page.waitForTimeout(500)

    // 3. 验证：所有格子都有活动
    const dayCells = page.locator('.day-cell')
    const cellCount = await dayCells.count()

    for (let i = 0; i < Math.min(cellCount, 7); i++) {
      const cell = dayCells.nth(i)
      const text = await cell.textContent()

      expect(text, `格子${i}不应该显示"今日无活动"`).not.toContain('今日无活动')

      const activityChips = cell.locator('.activity-chip')
      const chipCount = await activityChips.count()
      expect(chipCount, `格子${i}应该有活动`).toBeGreaterThan(0)
    }

    console.log('✅ 市集 Tab - 周三高亮模式验证通过')
  })

  test('灵活时间活动 Tab - 点击日期应该不影响显示', async ({ page }) => {
    // 1. 切换到"灵活时间活动" Tab
    const flexibleTab = page.locator('.tab-chips .filter-chip:has-text("灵活时间活动")').first()
    await expect(flexibleTab).toBeVisible()
    await flexibleTab.click()
    await page.waitForTimeout(1000)

    // 2. 获取初始活动数量
    const initialActivities = await page.locator('.activity-chip').count()
    console.log(`📊 初始活动数量: ${initialActivities}`)

    // 3. 尝试点击日期筛选（应该被忽略）
    const anyDayButton = page.locator('.day-cell-header:has-text("周一")')
    if (await anyDayButton.count() > 0) {
      await anyDayButton.first().click()
      await page.waitForTimeout(500)

      // 4. 验证：活动数量不应该改变
      const afterClickActivities = await page.locator('.activity-chip').count()
      console.log(`📊 点击后活动数量: ${afterClickActivities}`)

      expect(afterClickActivities, '灵活时间活动Tab不应该受日期筛选影响').toBe(initialActivities)
    }

    console.log('✅ 灵活时间活动 Tab - 日期筛选已正确禁用')
  })

  test('再次点击同一天应该取消筛选', async ({ page }) => {
    // 1. 切换到"兴趣班" Tab
    const interestClassTab = page.locator('.tab-chips .filter-chip:has-text("兴趣班")').first()
    await interestClassTab.click()
    await page.waitForTimeout(1000)

    // 2. 第一次点击"周一"
    const mondayButton = page.locator('.day-cell-header:has-text("周一")')
    await mondayButton.first().click()
    await page.waitForTimeout(500)

    // 3. 检查有高亮
    const highlightedCount1 = await page.evaluate(() => {
      let count = 0
      const chips = document.querySelectorAll('.activity-chip')
      chips.forEach(chip => {
        const style = chip.getAttribute('style') || ''
        if (style.includes('linear-gradient(135deg, #667eea')) {
          count++
        }
      })
      return count
    })
    console.log(`📊 第一次点击后高亮数量: ${highlightedCount1}`)
    expect(highlightedCount1).toBeGreaterThan(0)

    // 4. 再次点击"周一"（取消筛选）
    await mondayButton.first().click()
    await page.waitForTimeout(500)

    // 5. 验证：高亮应该消失
    const highlightedCount2 = await page.evaluate(() => {
      let count = 0
      const chips = document.querySelectorAll('.activity-chip')
      chips.forEach(chip => {
        const style = chip.getAttribute('style') || ''
        if (style.includes('linear-gradient(135deg, #667eea')) {
          count++
        }
      })
      return count
    })
    console.log(`📊 第二次点击后高亮数量: ${highlightedCount2}`)
    expect(highlightedCount2, '取消筛选后不应该有高亮').toBe(0)

    console.log('✅ 取消日期筛选验证通过')
  })

  test('完整流程：切换不同日期应该正确更新高亮', async ({ page }) => {
    // 切换到"兴趣班" Tab
    const interestClassTab = page.locator('.tab-chips .filter-chip:has-text("兴趣班")').first()
    await interestClassTab.click()
    await page.waitForTimeout(1000)

    const days = ['周一', '周二', '周三']

    for (const day of days) {
      console.log(`📅 测试切换到: ${day}`)

      // 点击日期
      const dayButton = page.locator(`.day-cell-header:has-text("${day}")`)
      await dayButton.first().click()
      await page.waitForTimeout(500)

      // 验证有高亮
      const hasHighlight = await page.evaluate(() => {
        const chips = document.querySelectorAll('.activity-chip')
        for (const chip of chips) {
          const style = chip.getAttribute('style') || ''
          if (style.includes('linear-gradient(135deg, #667eea')) {
            return true
          }
        }
        return false
      })

      expect(hasHighlight, `${day}应该有高亮活动`).toBe(true)
      console.log(`✅ ${day} 高亮正常`)
    }

    console.log('✅ 多日期切换验证通过')
  })
})

test.describe('日期筛选 - 回归测试', () => {
  test('不应该出现"今日无活动"的问题', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)

    // 切换到"兴趣班" Tab
    const interestClassTab = page.locator('.tab-chips .filter-chip:has-text("兴趣班")').first()
    await interestClassTab.click()
    await page.waitForTimeout(1000)

    // 依次点击所有日期，验证每个都不应该出现"今日无活动"
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

    for (const day of days) {
      console.log(`📅 测试: ${day}`)

      const dayButton = page.locator(`.day-cell-header:has-text("${day}")`)
      if (await dayButton.count() > 0) {
        await dayButton.first().click()
        await page.waitForTimeout(300)

        // 检查是否有"今日无活动"文本
        const noActivityText = page.locator('text=今日无活动')
        const count = await noActivityText.count()

        if (count > 0) {
          // 失败时截图
          await page.screenshot({
            path: `test-results/found-no-activity-${day}.png`,
            fullPage: true
          })
          console.log(`❌ ${day} 发现"今日无活动"`)
        }

        expect(count, `${day} 不应该出现"今日无活动"`).toBe(0)
      }
    }

    console.log('✅ 所有日期筛选都没有"今日无活动"问题')
  })
})
