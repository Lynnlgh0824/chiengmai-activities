import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('API边界条件测试', () => {
  test('应处理超出范围的页码', async ({ request }) => {
    const response = await request.get(BASE_URL + '/api/activities?page=999999')
    expect(response.status()).toBe(200)
  })

  test('应处理XSS攻击尝试', async ({ request }) => {
    const payload = '<script>alert(1)</script>'
    const response = await request.get(BASE_URL + '/api/activities?search=' + encodeURIComponent(payload))
    expect(response.status()).toBe(200)
  })

  test('应拒绝空必填字段', async ({ request }) => {
    const response = await request.post(BASE_URL + '/api/activities', { data: {} })
    expect(response.status()).toBe(400)
  })

  test('应处理不存在ID的PUT请求', async ({ request }) => {
    const response = await request.put(BASE_URL + '/api/activities/invalid-id', { data: { title: 'Test' } })
    expect(response.status()).toBe(404)
  })

  test('应处理不存在ID的DELETE请求', async ({ request }) => {
    const response = await request.delete(BASE_URL + '/api/activities/invalid-id')
    expect(response.status()).toBe(404)
  })
})
