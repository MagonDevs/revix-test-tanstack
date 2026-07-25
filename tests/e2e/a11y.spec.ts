import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'

/**
 * Phase 8 a11y sweep (US-701 through US-708). Runs axe-core against the
 * highest-traffic public routes and asserts zero serious/critical
 * violations — the achievable bar for a hardening pass, not a full
 * remediation project. Moderate/minor violations are logged, not failed,
 * so a clean run doesn't silently hide them.
 */
async function expectNoSeriousViolations(
  page: import('@playwright/test').Page,
) {
  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  const other = results.violations.filter(
    (v) => v.impact !== 'serious' && v.impact !== 'critical',
  )
  if (other.length > 0) {
    // eslint-disable-next-line no-console -- intentional: surfaces non-blocking findings in CI logs
    console.log(
      `[a11y] non-blocking violations (${other.map((v) => v.impact).join(', ')}):`,
      other.map((v) => `${v.id}: ${v.description}`),
    )
  }
  expect(
    serious,
    serious
      .map(
        (v) =>
          `${v.id} (${v.impact}): ${v.description} — ${v.nodes.length} node(s)`,
      )
      .join('\n'),
  ).toEqual([])
}

test('home page has no serious/critical a11y violations', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
  await expectNoSeriousViolations(page)
})

test('browse page has no serious/critical a11y violations', async ({
  page,
}) => {
  await page.goto('/pets')
  await expect(page.locator('h1')).toBeVisible()
  await expectNoSeriousViolations(page)
})

test('pet detail page has no serious/critical a11y violations', async ({
  page,
}) => {
  await page.goto('/pets')
  await expect(page.locator('h1')).toBeVisible()
  const firstCard = page.locator('a[href^="/pets/"]').first()
  await firstCard.waitFor({ state: 'visible' })
  await firstCard.click()
  await page.waitForURL(/\/pets\/[^/]+$/)
  await expect(page.locator('h1')).toBeVisible()
  await expectNoSeriousViolations(page)
})

test('login page has no serious/critical a11y violations', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('h1')).toBeVisible()
  await expectNoSeriousViolations(page)
})
