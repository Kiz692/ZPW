/**
 * E2E Page Helpers
 * Common page interaction utilities for E2E tests
 */

import { Page, Locator } from "@playwright/test";

/**
 * Wait for employee list to load
 */
export async function waitForEmployeeList(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  // Wait for any loading indicators to disappear
  await page.waitForTimeout(1000);
}

/**
 * Get employee count from page
 */
export async function getEmployeeCountFromPage(page: Page): Promise<number> {
  // Try to find count in various possible locations
  const countSelectors = [
    '[data-testid="employee-count"]',
    ".employee-count",
    '[aria-label*="count"]',
    "text=/\\d+ employees?/i",
  ];

  for (const selector of countSelectors) {
    const element = page.locator(selector).first();
    if ((await element.count()) > 0) {
      const text = await element.textContent();
      const match = text?.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
    }
  }

  // Fallback: count table rows
  const rows = await page.locator('tr, [data-testid="employee-row"]').count();
  return rows > 0 ? rows - 1 : 0; // Subtract header row if present
}

/**
 * Navigate to employees page
 */
export async function navigateToEmployees(page: Page): Promise<void> {
  await page.goto("/people/employees");
  await waitForEmployeeList(page);
}

/**
 * Navigate to persons page
 */
export async function navigateToPersons(page: Page): Promise<void> {
  await page.goto("/people/persons");
  await page.waitForLoadState("networkidle");
}
