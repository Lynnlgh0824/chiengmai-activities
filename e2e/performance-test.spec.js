import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('性能和并发测试', () => {
  test('API响应时间应在合理范围内', async ({ request }) => {
    const start = Date.now()
    const response = await request.get(`${BASE_URL}/api/activities`)
    const duration = Date.now() - start

    expect(response.status()).toBe(200)
    expect(duration).toBeLessThan(5000) // 5秒内响应
  })

  test('应处理并发读取请求', async ({ request }) => {
    const requests = Array(20).fill(null).map(() =>
      request.get(`${BASE_URL}/api/activities`)
    )

    const start = Date.now()
    const responses = await Promise.all(requests)
    const duration = Date.now() - start

    for (const response of responses) {
      expect(response.status()).toBe(200)
    }
    console.log(`20个并发请求耗时: ${duration}ms`)
  })

  test('应处理并发写入请求', async ({ request }) => {
    const requests = Array(5).fill(null).map((_, i) =>
      request.post(`${BASE_URL}/api/activities`, {
        data: { title: `Concurrent ${i}`, description: 'test' }
      })
    )

    const responses = await Promise.all(requests)

    for (const response of responses) {
      expect(response.status()).toBe(200)
    }

    // 清理
    for (const response of responses) {
      const data = await response.json()
      if (data.data?.id) {
        await request.delete(`${BASE_URL}/api/activities/${data.data.id}`)
      }
    }
  })

  test('大数据集不应导致性能问题', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const start = Date.now()

    await page.waitForSelector('.activity-card, [class*="activity"]', { timeout: 10000 })

    const duration = Date.now() - start
    console.log(`页面加载耗时: ${duration}ms`)
    expect(duration).toBeLessThan(10000) // 10秒内加载完成
  })
})
