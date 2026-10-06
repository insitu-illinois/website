import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const pages=(dir='dist'):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?pages(join(dir,entry.name)):entry.name.endsWith('.html')?[join(dir,entry.name)]:[]);
const publicPages=pages().filter(p=>!p.includes('/admin/'));
for(const width of [1440,390,320]) {
  test(`public pages pass accessibility and reflow checks at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    for(const path of publicPages) {
      await page.goto(path.replace(/^dist/,'').replace(/index\.html$/,''));
      const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(results.violations, path).toEqual([]);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),path).toBe(true);
    }
  });
}
test('keyboard skip link reaches main and people links open the correct profile',async({page})=>{
  await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
  await page.goto('/people/');await page.getByRole('link',{name:'Laura Shackelford',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Laura Shackelford');
  for(const name of ['Projects','Publications','Presentations','Awards & funding']) await expect(page.getByRole('heading',{name,exact:true,level:2})).toBeVisible();
});
test('draft people and papers are absent from every production page',()=>{
  const html=publicPages.map(p=>readFileSync(p,'utf8')).join('');
  for(const name of ['Lily Meyer','Beneath the Stone','Situated Cartographies','Computation in Context','cognitive-loads']) expect(html).not.toContain(name);
});
test('all internal links and assets resolve; public pages make no third-party requests',async({page})=>{
  const external:string[]=[];
  page.on('request',req=>{if(!new URL(req.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))external.push(req.url());});
  for(const path of publicPages){
    await page.goto(path.replace(/^dist/,'').replace(/index\.html$/,''));
    const links=await page.locator('[href],[src]').evaluateAll(elements=>elements.flatMap(el=>[el.getAttribute('href'),el.getAttribute('src')]).filter((v):v is string=>!!v&&v.startsWith('/')));
    for(const href of new Set(links))expect((await page.request.get(href)).status(),href).toBe(200);
  }
  expect(external).toEqual([]);
});
