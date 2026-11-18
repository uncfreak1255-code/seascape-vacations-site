const {chromium}=require(process.cwd()+'/node_modules/@playwright/test');
const AxeBuilder=require(process.cwd()+'/node_modules/@axe-core/playwright').default;
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.PROOF_DIR||'/tmp/property-photo-study-proof';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch();let checks=0;
 for(const width of [1440,390])for(const mode of ['book','folio']){
  const context=await browser.newContext({viewport:{width,height:1000}}); const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8793/?view='+mode);await page.locator('#stage').waitFor();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode()));});
  assert.equal(await page.locator('#spread > .page').count(),width>700&&mode==='book'?2:1);
  assert.equal(await page.locator('#photo-grid figure').count(),13);
  assert(await page.locator('#photo-grid img').evaluateAll(imgs=>imgs.every(i=>Math.abs(i.clientWidth/i.clientHeight-1.5)<.02)));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const axe=await new AxeBuilder({page}).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);
  await page.screenshot({path:path.join(out,`${mode}-${width}.png`),fullPage:true});
  await page.locator('#stage').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${mode}-${width}-gallery.png`)});
  await page.getByRole('button',{name:/Show photo 13:/}).click();await page.waitForTimeout(250);
  assert(await page.locator('#next').isDisabled());assert.match(await page.locator('#position').textContent(),/13 \/ 13/);
  await page.getByRole('button',{name:/Show photo 1:/}).click();
  // Deliberately overlap pointer navigation faster than the 200ms turn.
  await page.locator('#next').click({clickCount:3,delay:20});await page.waitForTimeout(250);
  assert.equal(await page.locator('.turn-leaf').count(),0);
  assert.match(await page.locator('#position').textContent(),width>700&&mode==='book'?/7–8/:/4 \/ 13/);
  await page.locator('#spread .photo-button').first().click();assert(await page.locator('dialog').isVisible());
  await page.keyboard.press('Escape');assert(!(await page.locator('dialog').isVisible()));
  assert(await page.locator('#spread .photo-button').first().evaluate(e=>e===document.activeElement));
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#previous').click();
  assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
  await page.locator('#stage').focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
  assert.deepEqual(errors,[]);checks++;await page.close();
 }
 const p=await browser.newPage();await p.route('**/property.json',r=>r.fulfill({status:503,body:'Unavailable'}));await p.goto('http://127.0.0.1:8793/');await p.getByText('Dockside Dreams photos are unavailable.',{exact:false}).waitFor();assert(await p.locator('#stage').isHidden());await p.close();checks++;
 const missing=await browser.newPage();await missing.route('**/images/**',r=>r.abort());await missing.goto('http://127.0.0.1:8793/');await missing.locator('#spread .missing').first().waitFor();assert.match(await missing.locator('#spread').textContent(),/photo unavailable/);await missing.locator('#spread .photo-button').first().click();await missing.locator('#full-error').waitFor();await missing.keyboard.press('Escape');await missing.close();checks++;
 for(const width of [1440,390]){const p=await browser.newPage({viewport:{width,height:1000}});await p.goto('http://127.0.0.1:8793/baseline/properties/dockside-dreams/');await p.getByRole('heading',{name:'Dockside Dreams',exact:true}).waitFor();for(const img of await p.locator('#all-photos img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,`baseline-${width}.png`),fullPage:true});await p.close();}
 await browser.close();console.log(`PASS ${checks} scenario groups; desktop/mobile photos, axe, navigation interruption, endpoints, keyboard, focus, reduced motion, error paths; proof: ${out}`);
})().catch(e=>{console.error(e);process.exit(1)});
