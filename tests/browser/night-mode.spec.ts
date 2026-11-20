import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const pages=(dir='dist'):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?pages(join(dir,entry.name)):entry.name.endsWith('.html')?[join(dir,entry.name)]:[]);

const pressed=(night:boolean)=>night?'true':'false';
async function expectTheme(page:any,night:boolean) {
  const toggle=page.getByRole('button',{name:'Night mode',exact:true});
  await expect(page.locator('html')).toHaveAttribute('data-theme',night?'night':'light');
  await expect(toggle).toHaveAttribute('aria-pressed',pressed(night));
  await expect(page.locator('[data-theme-state]')).toHaveText(night?'Turn off night mode':'Turn on night mode');
  await expect(page.locator('body')).toHaveCSS('background-color',night?'rgb(11, 13, 18)':'rgb(238, 241, 252)');
  await expect(toggle.locator('.moon-fill')).toHaveCSS('clip-path',night?'inset(0px)':'inset(100% 0px 0px)');
}

for(const scheme of ['light','dark'] as const) {
  test(`a first visit follows a ${scheme} device setting with no flash of the other theme`,async({page})=>{
    await page.emulateMedia({colorScheme:scheme});
    // Record the theme the moment the document element exists, before any stylesheet or body paints.
    await page.addInitScript(()=>{
      new MutationObserver((_,observer)=>{ if(document.body){ (window as any).firstTheme=document.documentElement.dataset.theme; observer.disconnect(); } }).observe(document,{childList:true,subtree:true});
    });
    await page.goto('/');
    expect(await page.evaluate(()=>(window as any).firstTheme)).toBe(scheme==='dark'?'night':'light');
    await expectTheme(page,scheme==='dark');
    expect(await page.evaluate(()=>localStorage.getItem('insitu-accessibility'))).toBeNull();
  });
}

test('the device setting is followed live until the toggle is pressed, then the saved choice wins',async({page})=>{
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('/');
  await expectTheme(page,false);
  await page.emulateMedia({colorScheme:'dark'});
  await expectTheme(page,true);
  // Changing another preference does not save a theme.
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByLabel('Text size',{exact:true}).selectOption('125');
  await page.keyboard.press('Escape');
  expect(JSON.parse((await page.evaluate(()=>localStorage.getItem('insitu-accessibility')))!).theme).toBeUndefined();
  await page.emulateMedia({colorScheme:'light'});
  await expectTheme(page,false);
  const toggle=page.getByRole('button',{name:'Night mode',exact:true});
  await toggle.focus(); await toggle.press('Space');
  await expectTheme(page,true);
  await expect(page.locator('[data-theme-status]')).toHaveText('Night mode on.');
  await expect(toggle.locator('.night-sun')).toHaveCount(0);
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('/publications/');
  await expectTheme(page,true);
  await expect(page.locator('html')).toHaveAttribute('data-text-size','125');
  await toggle.click();
  await expectTheme(page,false);
  await expect(page.locator('[data-theme-status]')).toHaveText('Night mode off.');
  await page.emulateMedia({colorScheme:'dark'});
  await page.reload();
  await expectTheme(page,false);
  // Resetting forgets the choice and returns to the device setting.
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByRole('button',{name:'Reset preferences'}).click();
  await page.keyboard.press('Escape');
  await expectTheme(page,true);
  await page.emulateMedia({colorScheme:'light'});
  await expectTheme(page,false);
  await page.reload(); await expectTheme(page,false);
});

test('moon filling honors both device and site reduced-motion preferences',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/');
  const moon=page.locator('.moon-fill');
  await expect(moon).toHaveCSS('transition-duration','0s');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(moon).toHaveCSS('transition-duration','0.6s');
  await page.locator('header').getByRole('button',{name:'Accessibility',exact:true}).click();
  await page.getByLabel('Reduce motion',{exact:true}).check();
  await page.keyboard.press('Escape');
  await expect(moon).toHaveCSS('transition-duration','0s');
});

for(const width of [1440,320]) {
  test(`all public night pages pass contrast and reflow at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.addInitScript(()=>localStorage.setItem('insitu-accessibility',JSON.stringify({theme:'night'})));
    for(const path of pages().filter(p=>!p.includes('/admin/'))) {
      await page.goto(path.replace(/^dist/,'').replace(/index\.html$/,''));
      const redirect=readFileSync(path,'utf8').match(/http-equiv="refresh" content="0;url=([^"]+)/)?.[1];
      if(redirect) await page.waitForURL(url=>url.pathname+url.hash===redirect);
      await page.evaluate(()=>document.fonts.ready);
      expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations,path).toEqual([]);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path).toBe(true);
    }
  });
}

test('night contrast and enlarged text also apply to the settings panel',async({page},testInfo)=>{
  await page.setViewportSize({width:320,height:700});
  await page.emulateMedia({colorScheme:'dark'});
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Night mode',exact:true})).toHaveAttribute('aria-pressed','true');
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
