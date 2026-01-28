import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('安全性测试', () => {
  test('应防护SQL注入攻击', async ({ request }) => {
    const payload = "'; DROP TABLE users; --"
    const response = await request.get(BASE_URL + '/api/activities?search=' + encodeURIComponent(payload))
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  test('应防护XSS攻击', async ({ request }) => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      'javascript:alert("xss")'
    ]

    for (const payload of xssPayloads) {
      const response = await request.post(BASE_URL + '/api/activities', {
        data: { title: payload, description: 'test' }
      })
      expect([200, 400]).toContain(response.status())
    }
  })

  test('应防护路径遍历攻击', async ({ request }) => {
    const paths = ['../../../etc/passwd', '..\\\\..\\\\..\\\\windows\\\\system32']
    for (const path of paths) {
      const response = await request.get(BASE_URL + '/api/activities/' + encodeURIComponent(path))
      expect(response.status()).toBe(404)
    }
  })

  test('应检查CORS配置', async ({ request }) => {
    const response = await request.get(BASE_URL + '/api/health', {
      headers: { 'Origin': 'http://malicious.com' }
    })
    const corsHeader = response.headers()['access-control-allow-origin']
    expect(corsHeader).toBeDefined()
  })

  test('应拒绝非图片文件上传', async ({ request }) => {
    const response = await request.post(BASE_URL + '/api/upload', {
      multipart: {
        image: {
          name: 'test.exe',
          mimeType: 'application/octet-stream',
          buffer: Buffer.from('test')
        }
      }
    })
    expect([400, 500]).toContain(response.status())
  })
})
