import {test,expect} from '@playwright/test';
test('publications link core authors inline and use named resource icons',async({page})=>{
 await page.goto('/publications/');
 await expect(page.getByText('People mentioned',{exact:true})).toHaveCount(0);
 await expect(page.getByText('No entries published yet.',{exact:true})).toHaveCount(0);
 await page.goto('/publications/from-past-to-present-2024/');
 await expect(page.locator('.publication-heading .authors').getByRole('link',{name:'Sepehr Vaez Afshar'})).toHaveAttribute('href','/people/sepehr-vaez-afshar/');
 await expect(page.locator('.publication-heading .authors').getByRole('link',{name:'Sarvin Eshaghi'})).toHaveAttribute('href','/people/sarvin-eshaghi/');
 const doi=page.getByRole('link',{name:'DOI',exact:true});await expect(doi.locator('svg')).toHaveCount(1);await doi.focus();await expect(doi).toBeFocused();
 await page.goto('/people/lily-meyer/');
 await expect(page.getByText('No entries published yet.',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Publications',exact:true})).toHaveCount(0);
 await expect(page.getByText('Bachelor’s student in Computer Science + Education at the University of Illinois Urbana-Champaign',{exact:true})).toBeVisible();
});
