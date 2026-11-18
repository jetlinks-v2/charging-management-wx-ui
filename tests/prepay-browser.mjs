import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
import vue from '@vitejs/plugin-vue'
import {chromium} from 'playwright'

// Render the real page, Vant controls and embedded styles; only the pricing/API boundary is a fixture.
const fixture = `import {reactive} from 'vue'
export const vm=reactive({
 options:{loading:false,error:'',refresh(){}},settings:[{id:'fee'}],activities:[],activityId:'',
 tier:{paidMonths:1,giftMonths:0},choices:Array.from({length:12},(_,i)=>({paidMonths:i+1,giftMonths:0})),
 pricing:{busy:false,prices:Object.fromEntries(Array.from({length:12},(_,i)=>[(i+1)+'-0',i===11?{error:'当前月份暂无可用费用',loading:false}:{error:'',loading:true}]))},
 get selected(){return this.pricing.prices[this.tier.paidMonths+'-'+this.tier.giftMonths]},
 get quote(){return this.selected?.quote},expired:false,confirm(){window.__confirmed=(window.__confirmed||0)+1},
 retry(){vm.pricing.prices[vm.tier.paidMonths+'-'+vm.tier.giftMonths]={loading:true,error:''}}
});export const usePrepay=()=>vm;window.__prepay=vm;`
const entry = `import {createApp} from 'vue';import Page from '/src/views/PrepayPage.vue';
import 'vant/lib/index.css';import css from '/src/style.css?inline';import mobile from '/src/components/mobile/mobile.css?inline';
import {mountBusinessStyles} from '/src/shell/styles.ts';mountBusinessStyles([css,mobile],'finance-business');
createApp(Page).mount('#page');window.__ready=true;`
const server=await createServer({configFile:false,root:process.cwd(),logLevel:'error',plugins:[{
 name:'prepay-fixture',enforce:'pre',
 resolveId(id,importer){
  if(id==='virtual:prepay-entry')return '\0prepay-entry'
  if(id.endsWith('/hooks/usePrepay')&&importer?.endsWith('/views/PrepayPage.vue'))return '\0prepay-state'
  if(id.endsWith('/components/RoomSwitcher.vue')&&importer?.endsWith('/views/PrepayPage.vue'))return '\0prepay-room'
 },
 load(id){
  if(id==='\0prepay-state')return fixture
  if(id==='\0prepay-entry')return entry
  if(id==='\0prepay-room')return `import {h} from 'vue';export default {render:()=>h('div',{class:'room-switch'},'元时代物业 · 12-201')}`
 },
 configureServer(s){s.middlewares.use('/__prepay-check',(_req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>.finance-business{height:100dvh;contain:layout paint;isolation:isolate;position:relative;max-width:560px;margin:auto;overflow:hidden}.business-scroll{height:100%;overflow:auto}.finance-business .app-shell{max-width:none;min-height:100%}.finance-business .dock{max-width:none}</style><main class="finance-business"><div class="business-scroll"><div class="app-shell"><div id="page"></div></div></div></main><script type="module" src="/@id/__x00__prepay-entry"></script>`)})}
},vue()],resolve:{dedupe:['vue']},server:{host:'127.0.0.1',port:0}})
let browser
const output='.agent-runtime/prepay-states'
try{
 await mkdir(output,{recursive:true});await server.listen()
 const origin=server.resolvedUrls.local[0]
 browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true})
 for(const width of [320,390,840]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto(origin+'__prepay-check');await page.waitForFunction(()=>window.__ready)
  const next=page.locator('.dock .van-button'),blocked=page.locator('.month-prices>button').last()
  assert.equal(await blocked.isDisabled(),true,'unavailable tier must be natively disabled')
  assert.equal(await blocked.getAttribute('aria-pressed'),'false')
  assert.equal(await blocked.locator('.month-check').count(),0)
  await blocked.evaluate(el=>el.click())
  assert.equal(await page.evaluate(()=>window.__prepay.tier.paidMonths),1,'disabled click cannot change the tier')
  await blocked.evaluate(el=>el.focus())
  assert.equal(await blocked.evaluate(el=>el===document.activeElement),false,'disabled tiers cannot receive keyboard focus')
  await page.locator('.month-prices>button').nth(1).click()
  assert.equal(await page.evaluate(()=>window.__prepay.tier.paidMonths),2,'available pending tiers remain selectable')
  await page.locator('.month-prices>button').first().click()
  assert.equal(await next.isDisabled(),true)
  assert.ok((await page.locator('.dock').innerText()).includes('计算中'))
  async function layout(state){
   const metrics=await page.locator('.dock').evaluate(el=>{
    const amount=el.firstElementChild,button=el.querySelector('button'),a=amount.getBoundingClientRect(),b=button.getBoundingClientRect(),dock=el.getBoundingClientRect()
    return {amountWidth:a.width,amountHeight:a.height,height:dock.height,overlap:a.right>b.left,buttonInside:b.right<=dock.right,background:getComputedStyle(button).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth}
   })
   assert.ok(metrics.amountWidth>=120,JSON.stringify(metrics));assert.ok(metrics.height<120,JSON.stringify(metrics))
   assert.equal(metrics.overlap,false);assert.equal(metrics.buttonInside,true);assert.equal(metrics.overflow,false)
   assert.notEqual(metrics.background,'rgba(0, 0, 0, 0)')
   await page.screenshot({path:output+'/'+state+'-'+width+'.png'})
  }
  await layout('loading')
  await page.evaluate(()=>{window.__prepay.pricing.prices['1-0']={loading:false,error:'当前月份暂无可用费用'}})
  assert.equal(await page.locator('.month-prices>button').first().isDisabled(),true)
  assert.equal(await page.locator('.month-prices>button').first().getAttribute('aria-pressed'),'false')
  assert.equal(await next.isDisabled(),true);assert.ok((await page.locator('.dock').innerText()).includes('暂不可用'))
  await layout('unavailable')
  await page.getByRole('button',{name:'重新加载',exact:true}).click()
  await page.locator('.dock-state').filter({hasText:'金额计算中'}).waitFor()
  assert.ok((await page.locator('.dock').innerText()).includes('金额计算中'))
  await page.evaluate(()=>{window.__prepay.pricing.prices['1-0']={loading:false,error:'',quote:{payAmount:'1734.84',originalAmount:'1734.84',lines:[]}}})
  await page.waitForFunction(()=>!document.querySelector('.dock button').disabled)
  assert.ok((await page.locator('.dock').innerText()).includes('1,734.84'))
  await layout('ready')
  await next.click();assert.equal(await page.evaluate(()=>window.__confirmed),1)
  await page.evaluate(()=>{window.__prepay.expired=true})
  assert.equal(await next.isDisabled(),true);assert.ok((await page.locator('.dock').innerText()).includes('金额已过期'))
  assert.deepEqual(errors,[])
  await page.close();console.log(width+'px: loading, disabled tiers, retry, ready, expiry and footer layout passed')
 }
}finally{await browser?.close();await server.close()}
