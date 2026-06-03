import { expect, test } from '@playwright/test';

test('renders the tub scene and supports controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Zhuangzi Beats the Tub' })).toBeVisible();
  await expect(page.getByText('His wife lies nearby.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Beat the tub' })).toBeVisible();
  await page.waitForTimeout(300);

  const nonBlankPixels = await page.locator('#scene').evaluate((canvas) => {
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!context) return 0;
    const pixels = new Uint8Array(80 * 80 * 4);
    context.readPixels(0, 0, 80, 80, context.RGBA, context.UNSIGNED_BYTE, pixels);
    let count = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 20) count += 1;
    }
    return count;
  });

  expect(nonBlankPixels).toBeGreaterThan(100);

  const beforeDrag = await page.locator('#scene').screenshot();
  await page.mouse.move(920, 460);
  await page.mouse.down();
  await page.mouse.move(1080, 460, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const afterDrag = await page.locator('#scene').screenshot();
  expect(Buffer.compare(beforeDrag, afterDrag)).not.toBe(0);

  await page.getByRole('button', { name: 'Turn the season' }).click();
  await expect(page.getByText('Before dawn')).toBeVisible();
  await expect(page.getByText('Huizi arrives expecting tears.')).toBeVisible();
});
