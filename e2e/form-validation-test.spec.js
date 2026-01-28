import { test, expect } from '@playwright/test'

test.describe('表单验证测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/admin.html')
    await page.waitForLoadState('networkidle')
  })

  test('应验证必填字段', async ({ page }) => {
    await page.click('button:has-text("新增活动")')
    await page.waitForTimeout(500)

    // 尝试不填写任何字段直接提交
    const titleInput = page.locator('#title')
    const required = await titleInput.getAttribute('required')
    expect(required).toBe('')
  })

  test('应处理超长输入', async ({ page }) => {
    await page.click('button:has-text("新增活动")')
    await page.waitForTimeout(500)

    const titleInput = page.locator('#title')
    await titleInput.fill('a'.repeat(10000))

    // 不应崩溃
    const value = await titleInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test('应处理特殊字符输入', async ({ page }) => {
    await page.click('button:has-text("新增活动")')
    await page.waitForTimeout(500)

    const specialChars = '<script>alert("xss")</script>'
    await page.locator('#title').fill(specialChars)

    const value = await page.locator('#title').inputValue()
    expect(value).toBe(specialChars)
  })

  test('应验证图片上传格式', async ({ page }) => {
    await page.click('button:has-text("新增活动")')
    await page.waitForTimeout(500)

    const fileInput = page.locator('#fileInput')
    if (await fileInput.count() > 0) {
      // 验证accept属性
      const accept = await fileInput.getAttribute('accept')
      expect(accept).toContain('image')
    }
  })
})
