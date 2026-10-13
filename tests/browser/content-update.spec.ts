import { test, expect } from '@playwright/test';

test('About omits the map while Join retains location access', async ({page}) => {
  await page.goto('/about/');
  await expect(page.locator('main iframe')).toHaveCount(0);
  await expect(page.locator('main #location')).toHaveCount(0);
  await page.goto('/join/');
  await expect(page.locator('#location')).toBeVisible();
});

test('verified work reaches person profiles and news keeps its source and image', async ({page}) => {
  await page.goto('/people/sarvin-eshaghi/');
  await expect(page.getByRole('link',{name:/Exploring the Role of Location-Based Games/})).toBeVisible();
  await expect(page.getByRole('link',{name:/From Past to Present/})).toBeVisible();
  await page.goto('/publications/location-based-games-climate-tourism-2025/');
  await expect(page.locator('.authors')).toContainText('Omid Mansourihanis');
  await expect(page.getByRole('link',{name:'DOI',exact:true})).toHaveAttribute('href','https://doi.org/10.1525/cse.2025.2439123');
  await page.goto('/news/studio-mdev-2025/');
  await expect(page.getByRole('img',{name:/The Stu\/dio team/})).toBeVisible();
  await expect(page.getByRole('link',{name:'Read the original story'})).toHaveAttribute('href',/ischool.illinois.edu/);
  for (const width of [1280,390,320]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/publications/');
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
