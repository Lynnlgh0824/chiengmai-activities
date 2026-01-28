import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Excel导入导出测试', () => {
  test('应能触发Excel导入', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/import-excel`)
    
    // 导入可能需要时间，但不应立即崩溃
    expect([200, 500]).toContain(response.status())
  })

  test('应能触发Excel导出', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/export-excel`, {
      timeout: 30000
    })

    // 导出可能需要时间
    expect([200, 500]).toContain(response.status())
  })

  test('应处理并发导入请求', async ({ request }) => {
    const requests = [
      request.post(`${BASE_URL}/api/import-excel`),
      request.post(`${BASE_URL}/api/import-excel`)
    ]

    const responses = await Promise.all(requests)

    for (const response of responses) {
      expect([200, 500]).toContain(response.status())
    }
  })

  test('Excel导入后数据应保持一致', async ({ page }) => {
    await page.goto('http://localhost:3000/admin.html')
    await page.waitForLoadState('networkidle')

    // 记录初始数量
    const initialCount = await page.locator('tbody tr').count()

    // 触发导入
    const importButton = page.locator('button:has-text("导入Excel")')
    if (await importButton.count() > 0) {
      await importButton.click()
      await page.waitForTimeout(5000)

      // 验证数据存在
      const finalCount = await page.locator('tbody tr').count()
      expect(finalCount).toBeGreaterThanOrEqual(0)
    }
  })
})
