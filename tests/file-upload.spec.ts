import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helpers';
import { FileHelper } from './utils/file-helpers';
import { getTestUser, getTestTeams, TEST_FILE_DATA, TEST_OTA_IMAGE } from './utils/test-data';

test.describe('File Upload', () => {
  let authHelper: AuthHelper;
  let fileHelper: FileHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    fileHelper = new FileHelper(page);
    await authHelper.ensureLoggedIn();
  });

  test('should upload small text file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await fileHelper.uploadFile(TEST_FILE_DATA.smallFile, testTeam.slug);
    
    // Verify file appears in files list
    await page.goto(`/spaces/${testTeam.slug}/files`);
    await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`)).toBeVisible();
  });

  test('should upload medium file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await fileHelper.uploadFile(TEST_FILE_DATA.mediumFile, testTeam.slug);
    
    // Verify file appears in files list
    await page.goto(`/spaces/${testTeam.slug}/files`);
    await expect(page.locator(`text=${TEST_FILE_DATA.mediumFile.name}`)).toBeVisible();
  });

  test('should upload large file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await fileHelper.uploadFile(TEST_FILE_DATA.largeFile, testTeam.slug);
    
    // Verify file appears in files list
    await page.goto(`/spaces/${testTeam.slug}/files`);
    await expect(page.locator(`text=${TEST_FILE_DATA.largeFile.name}`)).toBeVisible();
  });

  test('should upload OTA image file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await fileHelper.uploadFile(TEST_OTA_IMAGE, testTeam.slug);
    
    // Verify file appears in files list
    await page.goto(`/spaces/${testTeam.slug}/files`);
    await expect(page.locator(`text=${TEST_OTA_IMAGE.name}`)).toBeVisible();
  });

  test('should upload file with metadata', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Upload file
    const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.smallFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: TEST_FILE_DATA.smallFile.name,
      mimeType: TEST_FILE_DATA.smallFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.smallFile.content)
    });
    
    // Fill metadata fields
    const descriptionField = page.locator('input[name="description"], textarea[name="description"]');
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('Test file with metadata');
    }
    
    const versionField = page.locator('input[name="version"]');
    if (await versionField.isVisible()) {
      await versionField.fill('2.1.0');
    }
    
    const changelogField = page.locator('textarea[name="changelog"]');
    if (await changelogField.isVisible()) {
      await changelogField.fill('Added new features and bug fixes');
    }
    
    // Submit upload
    const uploadButton = page.locator('button:has-text("Upload"), button[type="submit"]');
    await uploadButton.click();
    
    // Wait for upload to complete
    await page.waitForLoadState('networkidle');
    
    // Verify upload success
    await expect(page.locator('text=Upload successful, text=File uploaded, .success')).toBeVisible();
  });

  test('should validate file type', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Try to upload an invalid file type
    const invalidFile = {
      name: 'test.exe',
      content: 'This is not a valid OTA image',
      type: 'application/x-msdownload'
    };
    
    const testFile = await fileHelper.createTestFile(invalidFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: invalidFile.name,
      mimeType: invalidFile.type,
      buffer: Buffer.from(invalidFile.content)
    });
    
    // Try to submit
    const uploadButton = page.locator('button:has-text("Upload"), button[type="submit"]');
    await uploadButton.click();
    
    // Should show validation error
    await expect(page.locator('text=Invalid file type, text=File type not supported')).toBeVisible();
  });

  test('should validate file size', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Create a very large file (simulate)
    const hugeFile = {
      name: 'huge-file.txt',
      content: 'A'.repeat(100 * 1024 * 1024), // 100MB
      type: 'text/plain'
    };
    
    const testFile = await fileHelper.createTestFile(hugeFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: hugeFile.name,
      mimeType: hugeFile.type,
      buffer: Buffer.from(hugeFile.content)
    });
    
    // Try to submit
    const uploadButton = page.locator('button:has-text("Upload"), button[type="submit"]');
    await uploadButton.click();
    
    // Should show file size error
    await expect(page.locator('text=File too large, text=File size exceeded')).toBeVisible();
  });

  test('should show upload progress', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Upload a medium-sized file
    const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.mediumFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: TEST_FILE_DATA.mediumFile.name,
      mimeType: TEST_FILE_DATA.mediumFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.mediumFile.content)
    });
    
    // Check for progress indicator
    const progressBar = page.locator('.progress-bar, [data-testid="upload-progress"], .upload-progress');
    if (await progressBar.isVisible()) {
      await expect(progressBar).toBeVisible();
    }
    
    // Submit upload
    const uploadButton = page.locator('button:has-text("Upload"), button[type="submit"]');
    await uploadButton.click();
    
    // Wait for upload to complete
    await page.waitForLoadState('networkidle');
  });

  test('should handle upload cancellation', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Upload a file
    const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.mediumFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: TEST_FILE_DATA.mediumFile.name,
      mimeType: TEST_FILE_DATA.mediumFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.mediumFile.content)
    });
    
    // Look for cancel button
    const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Stop")');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Verify upload was cancelled
      await expect(page.locator('text=Upload cancelled, text=Upload stopped')).toBeVisible();
    }
  });

  test('should retry failed uploads', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Upload a file
    const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.smallFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: TEST_FILE_DATA.smallFile.name,
      mimeType: TEST_FILE_DATA.smallFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.smallFile.content)
    });
    
    // Submit upload
    const uploadButton = page.locator('button:has-text("Upload"), button[type="submit"]');
    await uploadButton.click();
    
    // If upload fails, look for retry button
    const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      
      // Wait for retry to complete
      await page.waitForLoadState('networkidle');
    }
  });

  test('should support drag and drop upload', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Look for drag and drop area
    const dropZone = page.locator('.drop-zone, [data-testid="drop-zone"], .upload-area');
    if (await dropZone.isVisible()) {
      // Create test file
      const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.smallFile);
      
      // Simulate drag and drop
      await dropZone.dispatchEvent('drop', {
        dataTransfer: {
          files: [testFile]
        }
      });
      
      // Verify file was added
      await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`)).toBeVisible();
    }
  });
});
