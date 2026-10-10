import {test,expect} from '@playwright/test';

test('featured case works without loading a headset and links to project credits',async({page})=>{
  const modelRequests:string[]=[];
  page.on('request',request=>{if(/quest-viewer|\.glb(?:\?|$)/.test(request.url()))modelRequests.push(request.url());});
  await page.goto('/');
  const feature=page.locator('.feature-project').filter({hasText:'VRchaeology'});
  await expect(feature.getByRole('link',{name:'View project'})).toHaveAttribute('href','/projects/vrchaeology/');
  await expect(page.locator('[data-quest-model],.model-credit')).toHaveCount(0);
  await feature.locator('[data-case-toggle]').click();
  await expect(feature.locator('[data-booklet-open]')).toBeEnabled();
  await feature.locator('[data-disc-spin]').click();
  await expect(feature.locator('[data-disc-spin]')).toHaveAttribute('aria-pressed','true');
  await feature.locator('[data-booklet-open]').click();
  const close=page.getByRole('button',{name:'Close booklet',exact:true});
  await expect(close).toHaveText('');
  await close.click();await expect(page.locator('#case-booklet')).toBeHidden();
  await feature.locator('[data-booklet-open]').click();
  await page.getByRole('button',{name:'Next game image'}).click();
  await expect(page.locator('[data-scene-status]')).toHaveText('Scene 2 of 6');
  expect(modelRequests).toEqual([]);
  await page.getByRole('link',{name:'Full project credits'}).click();
  await expect(page).toHaveURL(/\/projects\/vrchaeology\/#credits-heading$/);
  await expect(page.locator('#credits-heading')).toBeVisible();
});

test('featured case reflows on small screens and has a useful no-script route',async({page,browser,baseURL})=>{
  await page.setViewportSize({width:320,height:800});
  await page.addInitScript(()=>localStorage.setItem('insitu-accessibility',JSON.stringify({theme:'night',textSize:'200',reduceMotion:true})));
  await page.goto('/');await page.locator('[data-case-toggle]').click();
  await page.locator('[data-booklet-open]').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('#case-booklet').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await expect(page.locator('.case-lid')).toHaveCSS('transition-duration','0s');
  const context=await browser.newContext({baseURL,javaScriptEnabled:false});
  const fallback=await context.newPage();await fallback.goto('/');
  await expect(fallback.locator('.game-case noscript img')).toBeVisible();
  await fallback.getByRole('link',{name:'Explore the game images'}).click();
  await expect(fallback.locator('#gallery-heading')).toBeVisible();
  await context.close();
});
