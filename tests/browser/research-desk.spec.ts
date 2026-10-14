import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('research desk opens CMS-backed details in place and restores focus',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const desk=page.locator('.research-desk');
  await desk.scrollIntoViewIfNeeded();await expect(desk).toHaveClass(/has-scene/);
  const trigger=desk.locator('[data-project="0"]');await trigger.focus();await page.keyboard.press('Enter');
  const dialog=desk.locator('#inspect-dialog');await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading',{name:'VRchaeology',exact:true})).toBeVisible();
  await expect(dialog.locator('#project-link')).toHaveAttribute('href','/projects/vrchaeology/');
  await dialog.locator('.gallery button').first().click();await expect(desk.locator('#photo-dialog')).toBeVisible();
  await page.keyboard.press('Escape');await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
  await desk.locator('[data-project="1"]').click();await expect(dialog.locator('#project-link')).toHaveAttribute('href','/projects/xr-us-museums/');
});

test('research desk dialog supports night mode, enlarged text and narrow screens',async({page})=>{
  await page.setViewportSize({width:320,height:800});
  await page.addInitScript(()=>localStorage.setItem('insitu-accessibility',JSON.stringify({theme:'night',textSize:'200',reduceMotion:true})));
  await page.goto('/');const desk=page.locator('.research-desk');await desk.locator('[data-project="0"]').click();
  const dialog=desk.locator('#inspect-dialog');await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await dialog.locator('#close-inspect').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
