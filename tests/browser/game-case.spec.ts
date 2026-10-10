import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('game artwork opens by keyboard, pages through all scenes, and closes with Escape',async({page})=>{
  await page.goto('/projects/vrchaeology/');
  const toggle=page.locator('[data-case-toggle]');
  await toggle.focus();await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  const opener=page.locator('[data-booklet-open]');
  await expect(opener).toBeFocused();await opener.press('Enter');
  await expect(page.locator('#case-booklet')).toBeVisible();
  await expect(page.getByRole('button',{name:'Close booklet'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button',{name:'Next game image'})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Close booklet'})).toBeFocused();
  await expect(page.locator('[data-scene]:visible')).toHaveCount(1);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  for(let i=2;i<=6;i++) {
    await page.getByRole('button',{name:'Next game image'}).click();
    await expect(page.locator('[data-scene-status]')).toHaveText(`Scene ${i} of 6`);
    await expect(page.locator('[data-scene]:visible img')).toHaveAttribute('alt',/.+/);
  }
  await page.getByRole('button',{name:'Next game image'}).click();
  await expect(page.locator('[data-scene-status]')).toHaveText('Scene 1 of 6');
  await page.getByRole('button',{name:'Previous game image'}).click();
  await expect(page.locator('[data-scene-status]')).toHaveText('Scene 6 of 6');
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#case-booklet')).toBeHidden();
  const position=await page.locator('.main-content').evaluate(el=>{
    const children=[...el.children];return {people:children.findIndex(x=>x.classList.contains('people-metadata')),credits:children.findIndex(x=>x.classList.contains('project-credits'))};
  });
  expect(position.people).toBeGreaterThan(position.credits);
});

test('open case reflows with night mode and enlarged text, and honors both reduced-motion settings',async({page})=>{
  await page.setViewportSize({width:320,height:800});
  await page.addInitScript(()=>localStorage.setItem('insitu-accessibility',JSON.stringify({theme:'night',textSize:'200',reduceMotion:true})));
  await page.goto('/projects/vrchaeology/');
  await page.locator('[data-case-toggle]').click();
  await page.locator('[data-booklet-open]').click();
  await expect(page.locator('#case-booklet')).toHaveCSS('animation-name','none');
  await expect(page.locator('.case-lid')).toHaveCSS('transition-duration','0s');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  expect(await page.locator('#case-booklet').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await page.locator('.site-header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByRole('button',{name:'Reset preferences'}).click();await page.keyboard.press('Escape');
  await expect(page.locator('.case-lid')).toHaveCSS('transition-duration','0.6s');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.case-lid')).toHaveCSS('transition-duration','0s');
});

test('game cover and full gallery remain accessible without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false});
  const page=await context.newPage();await page.goto('/projects/vrchaeology/');
  await expect(page.locator('.game-case noscript img')).toBeVisible();
  await expect(page.locator('[data-case-toggle]')).toBeHidden();
  await page.getByRole('link',{name:'Explore the game images'}).click();
  await expect(page.locator('.project-gallery figure')).toHaveCount(6);
  await context.close();
});

 test('headset availability works by keyboard without promising an online release',async({page})=>{
  await page.goto('/projects/vrchaeology/');
  const headset=page.getByRole('button',{name:'VR headset: game availability'});
  await headset.focus();await headset.press('Enter');
  await expect(headset).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#experience-availability')).toContainText('currently used offline');
  await expect(page.locator('#experience-availability')).toHaveText('VRchaeology is currently used offline.');
  await headset.press('Space');await expect(page.locator('#experience-availability')).toBeHidden();
  await expect(page.getByRole('heading',{name:'Ready for the classroom'})).toHaveCount(0);
  await expect(page.locator('.project-gallery')).toHaveCount(0);
});

test('real 3D headset loads locally, disc spins on activation, and tray closes the case',async({page})=>{
  await page.goto('/projects/vrchaeology/');
  const headset=page.locator('[data-quest-model]');
  await headset.scrollIntoViewIfNeeded();
  await expect(headset).toHaveAttribute('data-model','ready',{timeout:30000});
  await expect(headset.locator('canvas')).toBeVisible();
  const cover=page.locator('[data-case-toggle]');
  await expect(cover).toHaveAttribute('aria-expanded','false');await cover.click();
  const disc=page.locator('[data-disc-spin]');await disc.focus();await disc.press('Enter');
  await expect(disc).toHaveClass(/spinning/);await expect(disc).toHaveCSS('animation-name','disc-turn');
  await expect(disc).not.toHaveClass(/spinning/,{timeout:5000});
  await page.getByRole('button',{name:'Close the game case',exact:true}).focus();
  await page.getByRole('button',{name:'Close the game case',exact:true}).press('Enter');
  await expect(cover).toHaveAttribute('aria-expanded','false');await expect(cover).toBeFocused();
  await page.emulateMedia({reducedMotion:'reduce'});await cover.click();await disc.click();
  await expect(disc).not.toHaveClass(/spinning/);
});
