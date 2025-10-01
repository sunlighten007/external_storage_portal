import { Page, expect } from '@playwright/test';
import { getTestUser, TestUser } from './test-data';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(user: TestUser = getTestUser()) {
    await this.page.goto('/sign-in');
    
    // Wait for the login form to be visible
    await this.page.waitForSelector('form', { timeout: 10000 });
    
    // Fill in credentials
    await this.page.fill('input[name="email"]', user.email);
    await this.page.fill('input[name="password"]', user.password);
    
    // Submit the form
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('/dashboard');
    
    // Verify we're logged in by checking for dashboard elements
    await expect(this.page.locator('h1')).toContainText('Team Settings');
  }

  async logout() {
    // Look for logout button/link (adjust selector based on your UI)
    const logoutButton = this.page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Wait for redirect to login page
      await this.page.waitForURL('/sign-in');
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if we're on the dashboard or if user menu is visible
      const currentUrl = this.page.url();
      return currentUrl.includes('/dashboard') || currentUrl.includes('/spaces');
    } catch {
      return false;
    }
  }

  async ensureLoggedIn(user: TestUser = getTestUser()) {
    if (!(await this.isLoggedIn())) {
      await this.login(user);
    }
  }
}
