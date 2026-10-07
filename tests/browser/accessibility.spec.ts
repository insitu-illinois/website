import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const key = 'insitu-accessibility';
test('settings support keyboard focus, Escape, persistence, and reset', async ({page}) => {
  await page.goto('/');
  const opener = page.locator('header').getByRole('button', {name:'Accessibility',exact:true});
  await opener.focus(); await opener.press('Enter');
  const dialog = page.getByRole('dialog',{name:'Accessibility settings'});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button',{name:'Close',exact:true})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link',{name:'Accessibility statement'})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button',{name:'Close',exact:true})).toBeFocused();
  await dialog.getByLabel('Text size',{exact:true}).selectOption('150');
  await dialog.getByLabel('Reduce motion',{exact:true}).check();
  await dialog.getByLabel('Higher contrast',{exact:true}).check();
  await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
  await page.goto('/publications/');
  await expect(page.locator('html')).toHaveAttribute('data-text-size','150');
  await expect(page.locator('html')).toHaveAttribute('data-reduce-motion','true');
  await expect(page.locator('html')).toHaveAttribute('data-high-contrast','true');
  await expect(page.locator('body')).toHaveCSS('font-size','27px');
  const footer = page.locator('footer').getByRole('button',{name:'Accessibility',exact:true});
  await footer.click();
  await expect(dialog.getByLabel('Text size',{exact:true})).toHaveValue('150');
  await dialog.getByRole('button',{name:'Reset preferences'}).click();
  expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBeNull();
  await expect(page.locator('body')).toHaveCSS('font-size','18px');
  await dialog.getByRole('button',{name:'Close',exact:true}).click(); await expect(footer).toBeFocused();
});

test('enlarged high-contrast content and dialog reflow at 320 pixels',async({page},testInfo)=>{
  await page.setViewportSize({width:320,height:700});
  await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({textSize:'200',reduceMotion:true,highContrast:true})),key);
  for (const path of ['/','/publications/','/people/','/projects/vrchaeology/','/accessibility/']) {
    await page.goto(path);
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path).toBe(true);
    const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(result.violations,path).toEqual([]);
  }
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  const dialog=page.getByRole('dialog');
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await dialog.getByRole('button',{name:'Reset preferences'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-text-size','100');
  await page.screenshot({path:testInfo.outputPath('accessibility-mobile.png')});
});

test('site and device motion preferences both remove transitions',async({page})=>{
  await page.goto('/');
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByLabel('Reduce motion',{exact:true}).check();
  await expect(dialog.getByRole('button',{name:'Close',exact:true})).toHaveCSS('transition-duration','0s');
  await dialog.getByRole('button',{name:'Reset preferences'}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(dialog.getByRole('button',{name:'Close',exact:true})).toHaveCSS('transition-duration','0s');
});

test('storage failure and disabled JavaScript leave accessible alternatives',async({page,browser,baseURL})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked');}}));
  await page.goto('/');
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByLabel('Higher contrast',{exact:true}).check();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('cannot be saved');
  await expect(page.locator('html')).toHaveAttribute('data-high-contrast','true');
  const context=await browser.newContext({baseURL,javaScriptEnabled:false});
  const plain=await context.newPage(); await plain.goto('/');
  await plain.locator('header').getByRole('link',{name:'Accessibility',exact:true}).click();
  await expect(plain.getByRole('heading',{level:1,name:'Accessibility',exact:true})).toBeVisible();
  await expect(plain.locator('main noscript span')).toContainText('insituillinois [at] gmail [dot] com');
  await context.close();
});
