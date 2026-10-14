import {test,expect} from '@playwright/test';

test('historical media stays separate and animations play only on request',async({page})=>{
 const motionRequests:string[]=[];
 page.on('request',r=>{if(r.url().includes('-motion.webp'))motionRequests.push(r.url());});
 await page.goto('/projects/vrchaeology/');
 const history=page.locator('section[aria-labelledby="early-environments-heading"]');
 await expect(history.locator('figure')).toHaveCount(4);
 expect(motionRequests).toEqual([]);
 const play=history.locator('button[data-archive-animation]').first();
 const id=await play.getAttribute('aria-controls');const image=page.locator(`#${id}`);
 await play.focus();await page.keyboard.press('Enter');
 await expect(play).toHaveAttribute('aria-pressed','true');await expect(image).toHaveAttribute('src',/-motion.webp$/);
 await page.keyboard.press('Enter');await expect(play).toHaveAttribute('aria-pressed','false');await expect(image).not.toHaveAttribute('src',/-motion.webp$/);
 await expect(page.getByRole('heading',{name:'Accessibility research, 2020–2022'})).toBeVisible();
 await page.goto('/publications/');await expect(page.locator('a[href="/media/papers/cognitive-loads.pdf"]')).toBeVisible();
});
