import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('six destinations preserve research links and keyboard disclosure behavior',async({page})=>{
  await page.setViewportSize({width:1440,height:900}); await page.goto('/');
  const nav=page.getByRole('navigation',{name:'Main navigation'});
  await expect(nav.locator('.nav-list > li')).toHaveCount(6);
  const research=nav.locator('summary');
  await research.focus(); await research.press('Enter');
  await expect(nav.locator('.research-menu')).toHaveAttribute('open','');
  await expect(nav.locator('.research-links a')).toHaveText(['Projects','Research themes','Presentations','Awards & funding']);
  await page.keyboard.press('Tab'); await expect(nav.getByRole('link',{name:'Projects',exact:true})).toBeFocused();
  await page.keyboard.press('Escape'); await expect(research).toBeFocused();
  await expect(nav.locator('.research-menu')).not.toHaveAttribute('open','');
  await research.click(); await nav.getByRole('link',{name:'Research themes',exact:true}).click();
  await expect(page).toHaveURL(/\/about\/#themes$/); await expect(page.locator('#themes')).toBeVisible();
  for(const [name,path] of [['Projects','projects'],['Presentations','presentations'],['Awards & funding','awards-funding']]) {
    await nav.locator('summary').click(); await nav.getByRole('link',{name,exact:true}).click();
    await expect(page).toHaveURL(new RegExp('/'+path+'/$'));
    await expect(nav.locator('summary')).toHaveClass(/section-current/);
    await nav.locator('summary').click(); await expect(nav.getByRole('link',{name,exact:true})).toHaveAttribute('aria-current','page');
    await page.keyboard.press('Escape');
  }
  await nav.locator('summary').click();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.locator('h1').click({position:{x:10,y:10}}); await expect(nav.locator('.research-menu')).not.toHaveAttribute('open','');
});

test('mobile navigation and icon controls remain usable with enlarged text',async({page},testInfo)=>{
  await page.setViewportSize({width:320,height:800}); await page.goto('/');
  const nav=page.getByRole('navigation',{name:'Main navigation'});
  const menu=nav.getByRole('button',{name:'Menu',exact:true});
  await expect(nav.locator('.nav-list')).toBeHidden();
  await menu.focus(); await menu.press('Enter'); await expect(menu).toHaveAttribute('aria-expanded','true');
  await nav.locator('summary').click();
  await expect(nav.getByRole('link',{name:'Presentations',exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape'); await expect(nav.locator('summary')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(menu).toBeFocused(); await expect(nav.locator('.nav-list')).toBeHidden();
  const night=page.getByRole('button',{name:'Night mode',exact:true});
  for(const button of [night,page.locator('header').getByRole('button',{name:'Accessibility',exact:true})]) {
    const box=await button.boundingBox(); expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(button.locator('svg').first()).toBeVisible();
  }
  await night.focus(); await page.keyboard.press('Space'); await expect(night).toHaveAttribute('aria-pressed','true');
  await expect(night.locator('.night-moon')).toBeVisible();
  await expect(night.locator('.moon-fill')).toHaveCSS('clip-path','inset(0px)');
  await page.keyboard.press('Escape'); await expect(page.locator('[data-theme-state]')).toBeHidden();
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByLabel('Text size',{exact:true}).selectOption('200'); await page.keyboard.press('Escape');
  await menu.click(); await nav.locator('summary').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await nav.getByRole('link',{name:'Awards & funding',exact:true}).click(); await expect(page).toHaveURL(/\/awards-funding\/$/);
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByRole('button',{name:'Reset preferences'}).click(); await page.keyboard.press('Escape');
  await page.goto('/'); await menu.click(); await nav.locator('summary').click();
  await page.screenshot({path:testInfo.outputPath('mobile-navigation.png')});
});

test('all navigation destinations are reachable without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:800}});
  const page=await context.newPage(); await page.goto('/');
  const nav=page.getByRole('navigation',{name:'Main navigation'});
  await expect(nav.getByRole('link',{name:'Publications',exact:true})).toBeVisible();
  await nav.locator('summary').click(); await nav.getByRole('link',{name:'Projects',exact:true}).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await page.locator('header').getByRole('link',{name:'Accessibility',exact:true}).click();
  await expect(page).toHaveURL(/\/accessibility\/$/); await context.close();
});

test('a research menu opened during loading stays open after enhancement',async({page})=>{
  let releaseNavigation!:()=>void;
  let navigationScript='';
  const navigationReady=new Promise<void>(resolve=>{releaseNavigation=resolve;});
  await page.route('**/',async route=>{
    const response=await route.fetch();
    const html=(await response.text()).replace(/<script type="module">([\s\S]*?)<\/script>/g,(script,body)=>{
      if(!body.includes('.primary-navigation')) return script;
      navigationScript=body;
      return '<script type="module" src="/delayed-navigation.js"></script>';
    });
    await route.fulfill({response,body:html});
  });
  await page.route('**/delayed-navigation.js',async route=>{
    await navigationReady;
    await route.fulfill({contentType:'text/javascript',body:navigationScript});
  });
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'commit'});
  const research=page.locator('.research-menu');
  try {
    await research.locator('summary').click();
    await expect(research).toHaveAttribute('open','');
    expect(navigationScript).toContain('.primary-navigation');
  } finally { releaseNavigation(); }
  await page.waitForLoadState('load');
  await expect(research).toHaveAttribute('open','');
  await research.getByRole('link',{name:'Projects',exact:true}).click();
  await expect(page).toHaveURL(/\/projects\/$/);
});
