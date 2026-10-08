import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { indexingEnabled, crawlerPolicy } from '../../src/config/site.mjs';
import { loadRaw } from '../../scripts/validate-content.mjs';
import { hasPersonPage } from '../../src/lib/format.mjs';
const labEmail=JSON.parse(readFileSync('src/content/pages/footer.json','utf8')).email;
const [emailUser,emailDomain]=labEmail.split('@');
const readableEmail=`${emailUser} [at] ${emailDomain.replaceAll('.', ' [dot] ')}`;
const pages=(dir='dist'):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?pages(join(dir,entry.name)):entry.name.endsWith('.html')?[join(dir,entry.name)]:[]);
const publicPages=pages().filter(p=>!p.includes('/admin/'));
for(const width of [1440,390,320]) {
  test(`public pages pass accessibility and reflow checks at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    for(const path of publicPages) {
      await page.goto(path.replace(/^dist/,'').replace(/index\.html$/,''));
      const redirect=readFileSync(path,'utf8').match(/http-equiv="refresh" content="0;url=([^"]+)/)?.[1];
      if(redirect) await page.waitForURL(url=>url.pathname+url.hash===redirect);
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
  for(const record of Object.values(loadRaw()).flat() as any[]) if(record.data.draft) expect(html).not.toContain(`/${record.collection}/${record.id}/`);
});
test('all internal links and assets resolve; public pages make no third-party requests',async({page,baseURL})=>{
  const external:string[]=[];
  const checked=new Set<string>();
  page.on('request',req=>{if(new URL(req.url()).origin!==new URL(baseURL!).origin)external.push(req.url());});
  for(const path of publicPages){
    await page.goto(path.replace(/^dist/,'').replace(/index\.html$/,''));
      const redirect=readFileSync(path,'utf8').match(/http-equiv="refresh" content="0;url=([^"]+)/)?.[1];
      if(redirect) await page.waitForURL(url=>url.pathname+url.hash===redirect);
    const links=await page.locator('[href],[src]').evaluateAll(elements=>elements.flatMap(el=>[el.getAttribute('href'),el.getAttribute('src')]).filter((v):v is string=>!!v&&v.startsWith('/')));
    for(const href of new Set(links))if(!checked.has(href)){
      expect((await page.request.get(href)).status(),href).toBe(200);
      checked.add(href);
    }
  }
  expect(external).toEqual([]);
});
test('publication citation copies, relationships navigate, and reduced motion disables transitions',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/publications/motivational-support/');
  await page.getByRole('button',{name:'Copy BibTeX'}).click();
  await expect(page.locator('main').getByRole('status')).toHaveText('Citation copied.');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('motivational-support2019');
  await page.getByRole('link',{name:'VRchaeology',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('VRchaeology');
  await page.locator('main .tags').getByRole('link',{name:'Accessibility & belonging'}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Accessibility & belonging');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  expect(await page.locator('.home-hero .button').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
});
test('public sitemap and crawler policy expose public pages only',async({request})=>{
  const sitemap=await request.get('/sitemap.xml');expect(sitemap.ok()).toBeTruthy();
  const xml=await sitemap.text();expect(xml).toContain('/projects/vrchaeology/');expect(xml).not.toContain('cms-publishing-check');expect(xml).not.toContain('/admin/');
  const robots=await request.get('/robots.txt');expect(robots.headers()['content-type']).toContain('text/plain');expect(await robots.text()).toBe(crawlerPolicy(indexingEnabled,new URL(sitemap.url().replace('/sitemap.xml','/'))));
  expect((await request.get('/favicon.svg')).headers()['content-type']).toContain('image/svg+xml');
});
test('capture representative layouts and report browser errors',async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [1440,390])for(const path of ['/','/projects/vrchaeology/','/publications/motivational-support/','/people/laura-shackelford/','/people/','/join/']){
    await page.setViewportSize({width,height:900});await page.goto(path);await page.evaluate(async()=>{await document.fonts.ready;const images=[...document.images];images.forEach(img=>img.loading='eager');await Promise.all(images.map(img=>img.decode().catch(()=>{})));});
    await page.screenshot({path:testInfo.outputPath(`${width}-${path.replaceAll('/','_')}.png`),fullPage:true});
  }
  expect(errors).toEqual([]);
});

test('review pages carry noindex and the shared email is assembled only at runtime',async({page,request})=>{
  for(const path of pages()) {
    const response=await request.get(path.replace(/^dist/,'').replace(/index\.html$/,''));
    const html=await response.text();
    if(!indexingEnabled) expect(html,path).toMatch(/<meta[^>]+name="robots"[^>]+content="noindex, nofollow"/);
    expect(html,path).not.toContain(labEmail);
  }
  await page.goto('/join/');
  const contact=page.locator('main .lab-contact a');
  await expect(contact).toHaveAttribute('href','mailto:'+labEmail);
  await expect(contact).toHaveAccessibleName('Email the IN/SITU lab at '+readableEmail);
  await contact.focus();await expect(contact).toBeFocused();
  expect(await contact.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.goto('/people/');
  await expect(page.locator('main h2')).toHaveText(['Current members','Collaborators','Alumni']);
  const xml=await (await request.get('/sitemap.xml')).text();
  for(const person of loadRaw().people) {
    const path=`/people/${person.id}/`;
    if(hasPersonPage(person)&&!person.data.draft) expect(xml).toContain(path);
    else {
      expect(xml).not.toContain(path);
      const response=await request.get(path);
      if(person.data.role==='alumni' && person.data.bio?.trim() && !person.data.draft) {
        expect(response.status()).toBe(200);
        expect(await response.text()).toContain(`0;url=/people/#person-${person.id}`);
      } else expect(response.status()).toBe(404);
    }
  }
});
test('the lab email stays readable without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL});
  const page=await context.newPage();await page.goto('/join/');
  await expect(page.locator('main noscript span')).toHaveText('Email the lab: '+readableEmail);
  await expect(page.locator('main .lab-contact a')).toBeHidden();
  await context.close();
});

test('person and theme tags connect the new paper and news to their profiles',async({page})=>{
  await page.goto('/publications/bridging-anatomy-curricular-gaps/');
  await page.locator('main .main-content > .people-tags').getByRole('link',{name:'Laura Shackelford',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Appointments & affiliations'})).toBeVisible();
  await expect(page.getByText('Health Innovation Professor, Carle Illinois College of Medicine',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Bridging anatomy curricular gaps: Leveraging student-created video resources in elective courses',exact:true})).toBeVisible();
  await page.goto('/news/brian-graves-research-live-2026/');
  await page.locator('main .main-content > .people-tags').getByRole('link',{name:'Brian Graves',exact:true}).click();
  await expect(page.getByRole('link',{name:'Brian Graves named a Research Live finalist',exact:true})).toBeVisible();
  await page.goto('/themes/accessibility/');
  await expect(page.getByRole('link',{name:'Brian Graves named a Research Live finalist',exact:true})).toBeVisible();
});

test('the lab map loads inside the page only after keyboard activation',async({page})=>{
  await page.goto('/join/');
  await expect(page.locator('address')).toContainText('Davenport 209J');
  await expect(page.locator('iframe')).toHaveCount(0);
  const button=page.getByRole('button',{name:'Show lab map'});
  await button.focus();await expect(button).toBeFocused();await button.press('Enter');
  const frame=page.locator('iframe.lab-map');
  await expect(frame).toHaveAttribute('title','Google map of the lab location');
  await expect(frame).toHaveAttribute('src',/^https:\/\/www\.google\.com\/maps\/embed\?pb=/);
  await expect(frame).toBeVisible();
  await expect(button).toHaveCount(0);
});
