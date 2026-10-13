import {test,expect} from '@playwright/test';
test('people references are inline and portraits open non-alumni profiles',async({page})=>{
 for(const route of ['/presentations/','/awards-funding/','/news/']){
  await page.goto(route);await expect(page.getByText('People mentioned',{exact:true})).toHaveCount(0);
  await expect(page.locator('.page-intro svg')).toHaveCount(1);
 }
 await page.goto('/presentations/');await expect(page.locator('.metadata .inline-people a').first()).toBeVisible();
 await page.goto('/news/brian-graves-research-live-2026/');
 await expect(page.locator('.prose').getByRole('link',{name:'Brian Graves',exact:true})).toHaveAttribute('href','/people/brian-graves/');
 await expect(page.getByText('People mentioned',{exact:true})).toHaveCount(0);
 await page.goto('/people/');
 const portrait=page.getByRole('link',{name:'View Laura Shackelford’s profile',exact:true});await portrait.focus();await portrait.press('Enter');
 await expect(page).toHaveURL(/people\/laura-shackelford\/$/);
 await page.goto('/people/');await expect(page.locator('.alumni-entry .person-photo-link')).toHaveCount(0);
});
