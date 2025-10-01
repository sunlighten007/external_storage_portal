import { Page, expect } from '@playwright/test';
import { TEST_FILE_DATA, TEST_OTA_IMAGE } from './test-data';

export class FileHelper {
  constructor(private page: Page) {}

  async createTestFile(fileData: typeof TEST_FILE_DATA.smallFile) {
    // Create a temporary file for testing
    const fileContent = new Blob([fileData.content], { type: fileData.type });
    return new File([fileContent], fileData.name, { type: fileData.type });
  }

  async uploadFile(fileData: typeof TEST_FILE_DATA.smallFile, teamSlug: string = 'blaupunkt') {
    // Navigate to upload page
    await this.page.goto(`/spaces/${teamSlug}/upload`);
    
    // Wait for upload form
    await this.page.waitForSelector('input[type="file"]');
    
    // Create test file
    const testFile = await this.createTestFile(fileData);
    
    // Upload file using file input
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: fileData.name,
      mimeType: fileData.type,
      buffer: Buffer.from(fileData.content)
    });
    
    // Fill in additional form fields if they exist
    const descriptionField = this.page.locator('input[name="description"], textarea[name="description"]');
    if (await descriptionField.isVisible()) {
      await descriptionField.fill(`Test upload: ${fileData.name}`);
    }
    
    const versionField = this.page.locator('input[name="version"]');
    if (await versionField.isVisible()) {
      await versionField.fill('1.0.0');
    }
    
    const changelogField = this.page.locator('textarea[name="changelog"]');
    if (await changelogField.isVisible()) {
      await changelogField.fill('Test changelog for E2E testing');
    }
    
    // Submit upload
    const uploadButton = this.page.locator('button:has-text("Upload"), button[type="submit"]');
    await uploadButton.click();
    
    // Wait for upload to complete
    await this.page.waitForLoadState('networkidle');
    
    // Verify upload success (adjust based on your UI)
    await expect(this.page.locator('text=Upload successful, text=File uploaded, .success')).toBeVisible();
  }

  async downloadFile(fileName: string, teamSlug: string = 'blaupunkt') {
    // Navigate to files page
    await this.page.goto(`/spaces/${teamSlug}/files`);
    
    // Wait for files to load
    await this.page.waitForSelector('table, .file-list, [data-testid="file-item"]');
    
    // Find and click download button for the file
    const downloadButton = this.page.locator(`button:has-text("Download"), a:has-text("Download")`).first();
    await downloadButton.click();
    
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent('download');
    const download = await downloadPromise;
    
    return download;
  }

  async deleteFile(fileName: string, teamSlug: string = 'blaupunkt') {
    // Navigate to files page
    await this.page.goto(`/spaces/${teamSlug}/files`);
    
    // Wait for files to load
    await this.page.waitForSelector('table, .file-list, [data-testid="file-item"]');
    
    // Find the file row/item
    const fileRow = this.page.locator(`tr:has-text("${fileName}"), [data-testid="file-item"]:has-text("${fileName}")`);
    
    // Click delete button
    const deleteButton = fileRow.locator('button:has-text("Delete"), button[data-testid="delete-button"]');
    await deleteButton.click();
    
    // Confirm deletion if modal appears
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Wait for deletion to complete
    await this.page.waitForLoadState('networkidle');
    
    // Verify file is removed
    await expect(fileRow).not.toBeVisible();
  }

  async verifyFileExists(fileName: string, teamSlug: string = 'blaupunkt'): Promise<boolean> {
    await this.page.goto(`/spaces/${teamSlug}/files`);
    await this.page.waitForSelector('table, .file-list, [data-testid="file-item"]');
    
    const fileElement = this.page.locator(`text=${fileName}`);
    return await fileElement.isVisible();
  }

  async getFileList(teamSlug: string = 'blaupunkt'): Promise<string[]> {
    await this.page.goto(`/spaces/${teamSlug}/files`);
    await this.page.waitForSelector('table, .file-list, [data-testid="file-item"]');
    
    // Extract file names from the page
    const fileElements = await this.page.locator('td:first-child, .file-name, [data-testid="file-name"]').all();
    const fileNames = await Promise.all(
      fileElements.map(element => element.textContent())
    );
    
    return fileNames.filter(name => name && name.trim() !== '');
  }
}
