import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
const pages=(dir='dist'):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?pages(join(dir,entry.name)):entry.name.endsWith('.html')?[join(dir,entry.name)]:[]);

test('night mode is explicit, keyboard accessible, persistent, and resettable',async({page})=>{
  await page.emulateMedia({colorScheme:'dark'});
  await page.goto('/');
  const toggle=page.getByRole('button',{name:'Night mode',exact:true});
  await expect(toggle).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(255, 255, 255)');
  await toggle.focus(); await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(22, 22, 22)');
  await page.goto('/publications/');
  await expect(toggle).toHaveAttribute('aria-pressed','true');
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByLabel('Text size',{exact:true}).selectOption('125');
  await page.keyboard.press('Escape');
  await toggle.click(); await toggle.click(); await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-text-size','125');
  await expect(toggle).toHaveAttribute('aria-pressed','true');
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByRole('button',{name:'Reset preferences'}).click();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-pressed','false');
  await page.reload(); await expect(toggle).toHaveAttribute('aria-pressed','false');
});

for(const width of [1440,320]) {
  test(`all public night pages pass contrast and reflow at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.addInitScript(()=>localStorage.setItem('insitu-accessibility',JSON.stringify({theme:'night'})));
    for(const path of pages().filter(p=>!p.includes('/admin/'))) {
      await page.goto(path.replace(/^dist/,'').replace(/index\.html$/,''));
      await page.evaluate(()=>document.fonts.ready);
      expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations,path).toEqual([]);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path).toBe(true);
    }
  });
}

test('night contrast and enlarged text also apply to the settings panel',async({page},testInfo)=>{
  await page.setViewportSize({width:320,height:700});
  await page.goto('/');
  await page.getByRole('button',{name:'Night mode',exact:true}).click();
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByLabel('Higher contrast',{exact:true}).check();
  await page.getByLabel('Text size',{exact:true}).selectOption('200');
  const dialog=page.getByRole('dialog');
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await page.goto('/publications/');
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByRole('button',{name:'Reset preferences'}).click(); await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Night mode',exact:true}).click();
  await page.goto('/');
  await page.screenshot({path:testInfo.outputPath('night-mobile.png')});
});
