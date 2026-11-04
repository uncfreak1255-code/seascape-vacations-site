const { expect } = require('@playwright/test');
const order = ['the-oasis','dockside-dreams','sarasota-luxe','river-house','bradenton-pool-home','blue-house','coastal-stay','relaxing-oasis'];
async function selectScene(page, slug) {
  const next=page.getByRole('button',{name:'Next featured home',exact:true});
  await next.press('Home');
  for(let i=0;i<order.indexOf(slug);i++) await next.press('ArrowRight');
  await expect(page.locator('.g-scene:visible')).toHaveAttribute('data-scene',slug);
}
module.exports={selectScene};
