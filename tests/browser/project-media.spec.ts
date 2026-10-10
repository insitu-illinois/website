import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

test('VRchaeology shows the full cover, classroom status, editable gallery, and complete credits',async({page})=>{
  const project=JSON.parse(readFileSync('src/content/projects/vrchaeology.json','utf8'));
  await page.goto('/projects/vrchaeology/');
  const cover=page.locator('.project-cover .case-cover-art');
  await expect(cover).toHaveAttribute('src',project.heroMedia.src);
  await expect(cover).toHaveCSS('object-fit','contain');
  await expect(cover).toHaveCSS('aspect-ratio','auto');
  await expect(page.locator('main')).toContainText('VRchaeology is ready for classroom use.');
  await expect(page.locator('main')).toContainText('Development continues at the Game Studies and Design (GSD) Stu/dio');
  await expect(page.getByRole('heading',{name:'Lab contributors',exact:true})).toHaveCount(0);
  await expect(page.getByRole('list',{name:'Project team'}).getByRole('link',{name:'Sepehr Vaez Afshar',exact:true})).toBeVisible();
  const gallery=page.locator('.project-gallery');
  await expect(gallery.locator('figure')).toHaveCount(project.gallery.length);
  for(const [index,media] of project.gallery.entries()) {
    const figure=gallery.locator('figure').nth(index);
    await expect(figure.getByRole('img')).toHaveAttribute('alt',media.alt);
    await figure.scrollIntoViewIfNeeded();
    await expect.poll(()=>figure.locator('img').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
    const link=figure.getByRole('link');
    await expect(link).toHaveAttribute('href',media.src);
    await link.focus();await expect(link).toBeFocused();
  }
  const groups=page.locator('.credit-group');
  await expect(groups).toHaveCount(project.credits.length);
  for(const [index,credit] of project.credits.entries()) {
    await expect(groups.nth(index).getByRole('heading')).toHaveText(credit.role);
    await expect(groups.nth(index).locator('li')).toHaveText(credit.names.split('\n'));
  }
  await page.getByRole('link',{name:'Ask about classroom use',exact:true}).click();
  await expect(page).toHaveURL(/\/join\/#classroom-use$/);
  const contact=page.locator('#classroom-use .lab-contact a');
  await expect(contact).toHaveAttribute('href',/^mailto:/);
  await contact.focus();await expect(contact).toBeFocused();
  await page.goto('/');
  await expect(page.locator('.feature-project img')).toHaveAttribute('src',project.heroMedia.src);
  await expect(page.locator('.feature-project img')).toHaveCSS('object-fit','contain');
});
