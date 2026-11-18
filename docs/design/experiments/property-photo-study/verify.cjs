const {chromium}=require(process.cwd()+'/node_modules/@playwright/test');
const AxeBuilder=require(process.cwd()+'/node_modules/@axe-core/playwright').default;
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.PROOF_DIR||'/tmp/property-photo-study-proof';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch();let checks=0;
 const turnPage=await browser.newPage({viewport:{width:1440,height:1000}});
 await turnPage.goto('http://127.0.0.1:8793/?view=book');await turnPage.locator('#stage').waitFor();
 await turnPage.evaluate(async()=>Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode())));
 const original=await turnPage.locator('#spread > .page img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
 const all=await turnPage.locator('#photo-grid img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
 await turnPage.locator('#next').click();
 assert.equal(await turnPage.locator('.turn-front').count(),1,'A turning sheet needs a front face');
 assert.equal(await turnPage.locator('.turn-back').count(),1,'A turning sheet needs a reverse face');
 await turnPage.evaluate(()=>{for(const a of document.getAnimations()){a.pause();a.currentTime=a.effect.getTiming().duration*.3;}});
 assert.equal(await turnPage.locator('.turn-front img').getAttribute('src'),original[1]);
 assert.equal(await turnPage.locator('.turn-back img').getAttribute('src'),all[2]);
 assert.equal(await turnPage.locator('.turn-rest img').getAttribute('src'),original[0],'Outgoing left page stays until the sheet lands');
 assert.equal(await turnPage.locator('#spread > .page').nth(1).locator('img').getAttribute('src'),all[3]);
 assert.equal(await turnPage.locator('.turn-back').evaluate(e=>getComputedStyle(e).backfaceVisibility),'hidden');
 const motion=await turnPage.evaluate(()=>{const a=document.getAnimations().find(a=>a.effect.target.classList.contains('turn-leaf'));return {end:a.effect.getKeyframes().at(-1).transform,duration:a.effect.getTiming().duration};});
 assert.match(motion.end,/-180deg/,'The sheet must cross the spine and land flat');assert(motion.duration>=400&&motion.duration<=1000);
 await turnPage.locator('#stage').scrollIntoViewIfNeeded();await turnPage.screenshot({path:path.join(out,'book-turn-front.png')});
 await turnPage.evaluate(()=>{for(const a of document.getAnimations())a.currentTime=a.effect.getTiming().duration*.7;});
 await turnPage.screenshot({path:path.join(out,'book-turn-back.png')});
 await turnPage.emulateMedia({reducedMotion:'reduce'});await turnPage.waitForFunction(()=>!document.querySelector('.turn-leaf'));assert.equal(await turnPage.locator('.turn-leaf,.turn-rest,.turn-shadow').count(),0);
 assert.equal(await turnPage.locator('#spread > .page img').first().getAttribute('src'),all[2]);
 await turnPage.emulateMedia({reducedMotion:'no-preference'});await turnPage.waitForFunction(()=>!matchMedia('(prefers-reduced-motion:reduce)').matches);await turnPage.locator('#previous').click();
 await turnPage.evaluate(()=>{for(const a of document.getAnimations()){a.pause();a.currentTime=a.effect.getTiming().duration*.5;}});
 assert.equal(await turnPage.locator('.turn-front img').getAttribute('src'),all[2]);
 assert.equal(await turnPage.locator('.turn-back img').getAttribute('src'),original[1]);
 await turnPage.setViewportSize({width:390,height:1000});await turnPage.waitForFunction(()=>!document.querySelector('.turn-leaf'));
 assert.equal(await turnPage.locator('#spread > .page').count(),1);
 await turnPage.locator('#next').click();assert.equal(await turnPage.locator('.turn-front').count(),1,'Phone also turns a sheet');
 await turnPage.waitForFunction(()=>!document.querySelector('.turn-leaf'));await turnPage.close();checks++;

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
  await page.getByRole('button',{name:/Show photo 13:/}).click();await page.waitForFunction(()=>!document.querySelector('.turn-leaf'));await page.waitForTimeout(220);
  assert(await page.locator('#next').isDisabled());assert.match(await page.locator('#position').textContent(),/13 \/ 13/);
  await page.getByRole('button',{name:/Show photo 1:/}).click();
  // Deliberately overlap pointer navigation faster than a complete physical turn.
  await page.locator('#next').click({clickCount:3,delay:20});await page.waitForFunction(()=>!document.querySelector('.turn-leaf'));await page.waitForTimeout(220);
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
