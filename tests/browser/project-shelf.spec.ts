import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
test('project shelf switches published projects and reflows',async({page})=>{
 await mkdir('/tmp/insitu-shelf',{recursive:true});
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 const shelf=page.locator('[data-project-shelf]');
 await expect(shelf.locator('[data-project-panel]:visible')).toHaveCount(1);
 await expect(page.locator('#shelf-vrchaeology')).toBeVisible();
 const buttons=shelf.locator('[data-project-choice]');await expect(buttons).toHaveCount(4);
 for(const button of await buttons.all()){
  await button.click();await expect(button).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#'+await button.getAttribute('aria-controls'))).toBeVisible();
 }
 await buttons.first().focus();await page.keyboard.press('Enter');await expect(page.locator('#shelf-vrchaeology')).toBeVisible();
 await shelf.screenshot({path:'/tmp/insitu-shelf/desktop.png'});
 expect((await new AxeBuilder({page}).include('[data-project-shelf]').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:390,height:844});await shelf.screenshot({path:'/tmp/insitu-shelf/mobile.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.setViewportSize({width:320,height:800});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
