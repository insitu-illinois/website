import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

test('shared values, footer credit, and new profile links survive navigation',async({page})=>{
  const values=JSON.parse(readFileSync('src/content/pages/values.json','utf8'));
  await page.goto('/');
  await expect(page.locator('#values li')).toHaveText([values.participation,values.context,values.collaboration]);
  await expect(page.locator('#values')).toContainText('Pending lab review');
  await expect(page.locator('footer')).not.toContainText('Davenport 209J');
  await expect(page.locator('footer')).toContainText('Developed by Sep Vaez Afshar');
  await page.locator('footer').getByRole('link',{name:'Lab values',exact:true}).click();
  await expect(page).toHaveURL(/\/about\/#values$/);
  await expect(page.locator('#values li')).toHaveText([values.participation,values.context,values.collaboration]);
  await page.goto('/people/lily-meyer/');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Lily Meyer');
  await expect(page.getByRole('link',{name:'Lily Meyer on LinkedIn'})).toHaveAttribute('href','https://www.linkedin.com/in/lily-i-meyer');
  await expect(page.locator('main .profile-links svg')).toHaveCount(1);
  await page.goto('/people/sepehr-vaez-afshar/');
  for(const label of ['LinkedIn','Google Scholar','Website']) {
    const link=page.getByRole('link',{name:`Sepehr Vaez Afshar on ${label}`});
    await expect(link).toBeVisible(); await expect(link.locator('svg')).toBeVisible();
    await link.focus(); await expect(link).toBeFocused();
  }
  await page.goto('/people/zade-lobo/');
  await expect(page).toHaveURL(/\/people\/#person-zade-lobo$/);
  const zade=page.locator('#person-zade-lobo');
  await expect(zade.locator('details')).toHaveCount(0);
  await expect(zade.getByRole('img',{name:'Portrait of Zade Bosco Lobo'})).toBeVisible();
  await expect(zade.getByRole('link')).toHaveCount(2);
  await expect(zade.getByRole('link',{name:'Zade Bosco Lobo on LinkedIn'})).toHaveAttribute('href','https://www.linkedin.com/in/zadelobo/');
  const website=zade.getByRole('link',{name:'Zade Bosco Lobo on Website'});
  await expect(website).toHaveAttribute('href','https://zadelobo.com/');
  await website.focus(); await expect(website).toBeFocused();
  await expect(website.locator('svg')).toBeVisible();
  const alumni=page.locator('section[aria-labelledby="people-alumni"]');
  await expect(alumni.locator('details')).toHaveCount(0);
  await expect(alumni).not.toContainText('After graduation');
  await expect(alumni.getByRole('link',{name:/Google Scholar/})).toHaveCount(0);
});
