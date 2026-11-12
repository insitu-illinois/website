// Frame audit: every generated public page must carry the same header, menu, and footer,
// taken from src/config/navigation.mjs, at desktop and phone widths in both themes.
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { destinations, primaryMenu, footerMenu, expectedCurrent } from '../../src/config/navigation.mjs';
import values from '../../src/content/pages/values.json' with { type: 'json' };

const files=(dir='dist'):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(dir,entry.name)):entry.name.endsWith('.html')?[join(dir,entry.name)]:[]);
const publicFiles=files().filter(file=>!file.includes('/admin/'));
const route=(file:string)=>file.replace(/^dist/,'').replace(/index\.html$/,'');
const redirectOf=(file:string)=>readFileSync(file,'utf8').match(/http-equiv="refresh" content="0;url=([^"]+)/)?.[1];
const label=(id:string)=>destinations[id as keyof typeof destinations].label;
const menuLabels=primaryMenu.flatMap(entry=>'group' in entry?entry.items!.map(label):[label(entry.id!)]);
const footerLabels=footerMenu.flatMap(column=>column.items.filter(id=>id!=='accessibility-settings'&&!(id==='values'&&values.draft)).map(label));

for(const theme of ['night','light']) for(const width of [1280,375]) {
  test(`every page carries the one frame at ${width}px in ${theme} mode`,async({page})=>{
    await page.addInitScript(value=>localStorage.setItem('insitu-accessibility',JSON.stringify({theme:value})),theme);
    await page.setViewportSize({width,height:900});
    const errors:string[]=[];
    // Failed requests are reported with their address by the response listener below. Chrome may also probe
    // /favicon.ico on its own before it reads the page's icon link; that probe is not part of the page.
    page.on('console',message=>{if(message.type()==='error'&&!message.text().startsWith('Failed to load resource'))errors.push(`${page.url()}: ${message.text()}`);});
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()} (on ${page.url()})`);});
    page.on('pageerror',error=>errors.push(`${page.url()}: ${error.message}`));
    let firstHeader='',firstFooter='';
    for(const file of publicFiles) {
      await page.goto(route(file));
      const redirect=redirectOf(file);
      if(redirect) await page.waitForURL(url=>url.pathname+url.hash===redirect);
      // The 404 file is served at /404.html; its menu state follows that address.
      const path=new URL(page.url()).pathname;
      const frame=await page.evaluate(()=>{
        const nav=document.querySelector('.primary-navigation')!;
        const text=(el:Element)=>el.textContent!.replace(/\s+/g,' ').trim();
        // Compare the markup the build produced, without the per-page "current" marks.
        const neutral=(selector:string)=>{
          const copy=document.querySelector(selector)!.cloneNode(true) as Element;
          copy.querySelectorAll('[aria-current]').forEach(el=>el.removeAttribute('aria-current'));
          copy.querySelectorAll('.section-current').forEach(el=>{el.classList.remove('section-current');if(!el.className)el.removeAttribute('class');el.querySelector('.visually-hidden')?.remove();});
          // Astro inlines a component's script at its first use on the page, which may be above the footer.
          copy.querySelectorAll('script').forEach(el=>el.remove());
          // Disclosure state set by the menu script is runtime, not frame.
          copy.querySelectorAll('[style],[data-expanded],[hidden],[open]').forEach(el=>['style','data-expanded','hidden','open'].forEach(name=>el.removeAttribute(name)));
          return copy.outerHTML;
        };
        return {
          overflow:document.documentElement.scrollWidth>window.innerWidth,
          headers:document.querySelectorAll('header.site-header').length,
          footers:document.querySelectorAll('footer.site-footer').length,
          menu:[...nav.querySelectorAll('.nav-list a')].map(text),
          currentPage:[...nav.querySelectorAll('[aria-current="page"]')].map(text),
          currentSection:[...nav.querySelectorAll('summary.section-current')].map(el=>text(el).replace(' (current section)','')),
          footerLinks:[...document.querySelectorAll('.site-footer .footer-grid > div:not(.footer-identity) a')].map(text),
          header:neutral('header.site-header'),
          footer:neutral('footer.site-footer'),
        };
      });
      expect(frame.overflow,`${path} scrolls sideways`).toBe(false);
      expect([frame.headers,frame.footers],path).toEqual([1,1]);
      expect(frame.menu,path).toEqual(menuLabels);
      expect(frame.footerLinks,path).toEqual(footerLabels);
      const expected=expectedCurrent(path);
      expect(frame.currentPage,`${path} current item`).toEqual(expected.page);
      expect(frame.currentSection,`${path} current section`).toEqual(expected.section);
      firstHeader||=frame.header; firstFooter||=frame.footer;
      expect(frame.header===firstHeader,`${path} header differs from the first page`).toBe(true);
      expect(frame.footer===firstFooter,`${path} footer differs from the first page`).toBe(true);
      if(width<=375) {
        const toggle=page.getByRole('button',{name:'Menu',exact:true});
        await expect(toggle,path).toBeVisible();
        const box=(await toggle.boundingBox())!;
        expect(Math.min(box.width,box.height),`${path} menu button touch target`).toBeGreaterThanOrEqual(44);
      }
    }
    expect(errors).toEqual([]);
  });
}

test('every internal anchor points at an element that exists',()=>{
  const ids=new Map(files().map(file=>[route(file),new Set([...readFileSync(file,'utf8').matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]))]));
  const broken:string[]=[];
  for(const file of publicFiles) for(const [,href] of readFileSync(file,'utf8').matchAll(/href="([^"]*#[^"]+)"/g)) {
    if(/^[a-z]+:/i.test(href)) continue;
    const [target,hash]=href.split('#');
    const page=target?target:route(file);
    if(!ids.get(page)?.has(decodeURIComponent(hash))) broken.push(`${route(file)} → ${href}`);
  }
  expect(broken).toEqual([]);
});
