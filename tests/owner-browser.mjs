import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
import vue from '@vitejs/plugin-vue'
import {chromium} from 'playwright'

// Only API and host context are fixtures. Render the real module shell, routes, hooks and controls.
const fixture=`
export const calls=[];window.__calls=calls;window.__energyFail=false;
export const rooms=[{projectId:'project',projectName:'元时代物业',spaceId:'room',name:'201',fullName:'元时代物业/12幢/201',customerName:'李秀辉',nature:'owner'},{projectId:'project',projectName:'元时代物业',spaceId:'empty',name:'1602',fullName:'元时代物业/16幢/1602',customerName:'李秀辉',nature:'owner'}];
const bills=[{id:'property',subjectName:'物业费',standardName:'住宅物业费',periodStart:'2026-11-01',periodEnd:'2026-11-30',dueDate:'2026-11-30',receivableDate:'2026-11-01',periodStatus:'OPEN',amount:'289.14',paidAmount:'0.00',arrears:'289.14',discount:'0.00',lateFee:'0.00'},{id:'gas-bill',subjectName:'燃气费',standardName:'居民燃气费',energyType:'gas',sourceType:'METER',periodStart:'2026-10-01',periodEnd:'2026-10-31',dueDate:'2026-11-30',receivableDate:'2026-11-01',confirmedDate:'2026-11-18',periodStatus:'CLOSED',amount:'46.50',paidAmount:'0.00',arrears:'46.50',discount:'0.00',lateFee:'0.00',usage:'18.60000000',price:'2.50'}];
const settings=[{id:'water',subjectId:'water',subjectName:'水费',standardId:'water-standard',standardName:'居民生活用水',energyType:'water',price:'3.50'},{id:'gas',subjectId:'gas',subjectName:'燃气费',standardId:'gas-standard',standardName:'居民燃气费',energyType:'gas',price:'2.50'}];
const accounts=[{id:'water-account',subjectId:'water',subjectName:'水费',standardId:'water-standard',standardName:'居民生活用水',balance:'162.80',available:'162.80'},{id:'property-account',subjectId:'property',subjectName:'物业费',standardId:'property-standard',standardName:'住宅物业费',balance:'289.14',available:'289.14'}];
const page=(data,totalAmount='0.00')=>({data,total:data.length,pageIndex:0,pageSize:20,totalAmount});
export class ApiError extends Error{constructor(message,status){super(message);this.status=status}}
export const errorText=e=>e?.message||'请求失败';
export async function request(path,body){
 calls.push({path,body});await new Promise(r=>setTimeout(r,20));
 if(path==='/authorize/me')return {user:{id:'owner',name:'李秀辉'},permissions:[{id:'finance-owner',actions:['query']}]};
 if(path.endsWith('/rooms'))return rooms;
 const empty=path.includes('/spaces/empty/'),url=new URL(path,'http://fixture');
 if(path.includes('/prepay/deposit/quote')){
  if(empty)throw new ApiError('当前房屋未配置收费标准',409);
  const setting=settings.find(s=>s.id===body.settingId);if(!setting)throw new ApiError('收费标准已变化',409);
  return {...setting,settingId:setting.id,amount:body.amount,houseName:rooms[0].fullName,payerName:'李秀辉',paymentAvailable:false};
 }
 if(path.includes('/energy?')){
  if(window.__energyFail)throw new ApiError('能源用量暂时无法获取',503);
  const month=url.searchParams.get('month');return {month,settings:empty?[]:settings,accounts:empty?[]:accounts,meters:empty?[]:[
   {id:'water-meter',name:'住宅水表',energyType:'water',usage:'12.40',complete:false,lastTime:1794970000000,days:Array.from({length:18},(_,i)=>({date:month+'-'+String(i+1).padStart(2,'0'),usage:i===2?null:'0.688888888889',complete:i!==2}))},
   {id:'gas-meter',name:'住宅燃气表',energyType:'gas',usage:'18.60',complete:true,lastTime:1794970000000,days:[]}]};
 }
 if(path.includes('/bills/')){const result=bills.find(b=>path.endsWith('/'+b.id));if(!result||empty)throw new ApiError('未找到当前房屋的本人账单',404);return result}
 if(path.includes('/bills?')){const type=url.searchParams.get('energyType');const rows=empty||url.searchParams.get('paid')==='true'?[]:bills.filter(b=>!type||b.energyType===type);return page(rows,rows.reduce((s,b)=>s+Number(b.arrears),0).toFixed(2))}
 if(path.endsWith('/accounts'))return empty?[]:accounts;
 if(path.includes('/entries?'))return page(empty?[]:[{id:'entry',action:'TOPUP',subjectName:'水费',standardName:'居民生活用水',occurredAt:'2026-11-18T09:00:00',amount:'162.80',beforeBalance:'0.00',afterBalance:'162.80'}]);
 if(path.includes('/records?'))return page([]);
 if(path.endsWith('/prepay/options'))return empty?[]:[{id:'property',settlementMethod:'MONTHLY',activities:[]}];
 if(path.endsWith('/prepay/quote'))return {id:'quote-'+body.paidMonths,status:'OPEN',expiresAt:Date.now()+600000,businessDate:'2026-11-18',houseName:rooms[0].fullName,payerName:'李秀辉',payAmount:(289.14*body.paidMonths).toFixed(2),originalAmount:(289.14*body.paidMonths).toFixed(2),lines:[{type:'FUTURE',start:'2026-12-01',end:'2026-12-31',originalAmount:(289.14*body.paidMonths).toFixed(2),paidAmount:(289.14*body.paidMonths).toFixed(2),discountAmount:'0.00'}]};
 throw new Error('Unexpected API '+path);
}`
const entry=`import {createApp} from 'vue';import {createRouter,createWebHashHistory,RouterView} from 'vue-router';
import ModuleRoot from '/src/shell/ModuleRoot.vue';import {businessRoutes} from '/src/businessRoutes';
import {roomsState,selectRoom} from '/src/services/rooms';import {installMobile} from '/src/components/mobile/install';import 'vant/lib/index.css';
const router=createRouter({history:createWebHashHistory(),routes:[{path:'/applications/charging-app',component:ModuleRoot,children:businessRoutes}]});
await router.push(location.hash.startsWith('#/applications/charging-app')?location.hash.slice(1):'/applications/charging-app');await router.isReady();const app=createApp(RouterView);installMobile(app);app.use(router).mount('#app');window.__router=router;window.__selectRoom=id=>selectRoom(roomsState.rooms.find(r=>r.spaceId===id));`
const core=`import {ref} from 'vue';import {request} from 'virtual:owner-api';const context={project:ref({code:'fixture'}),application:ref({id:'app',templateCode:'sfgl'}),request:(path,options={})=>request(path,options.body)};export const useMobileAppContext=()=>context;`
const server=await createServer({configFile:false,root:process.cwd(),logLevel:'error',plugins:[{
 name:'owner-fixture',enforce:'pre',
 resolveId(id,importer){if(id==='virtual:owner-entry')return '\0owner-entry';if(id==='virtual:owner-api'||id.endsWith('/api/http')||id==='./http'&&importer?.endsWith('/api/finance.ts'))return '\0owner-api';if(id==='@jetlinks-mobile-core')return '\0owner-core'},
 load(id){if(id==='\0owner-entry')return entry;if(id==='\0owner-api')return fixture;if(id==='\0owner-core')return core},
 configureServer(s){s.middlewares.use('/__owner-check',(_req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#edf3f8}</style><div id="app"></div><script type="module" src="/@id/__x00__owner-entry"></script>')})}
},vue()],resolve:{dedupe:['vue','vue-router']},server:{host:'127.0.0.1',port:0}})
let browser
const output='.agent-runtime/owner-redesign'
try{
 await mkdir(output,{recursive:true});await server.listen();const origin=server.resolvedUrls.local[0]
 browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true})
 for(const width of [320,390,840]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[]
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)console.error(r.status(),r.url())})
  await page.goto(origin+'__owner-check');try{await page.locator('.home-statement .money-display').waitFor()}catch(e){console.error(errors,await page.locator('body').innerText());throw e}
  const back=()=>page.getByRole('button',{name:'返回',exact:true}).click()
  async function layout(name){
   const metrics=await page.locator('.app-shell').evaluate(el=>({width:el.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth,local:el.scrollWidth>el.clientWidth+1}))
   await page.screenshot({path:output+'/'+name+'-'+width+'.png'})
   if(metrics.local)console.error(await page.locator('.app-shell').evaluate(el=>[...el.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>el.getBoundingClientRect().right+1).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))))
   assert.equal(metrics.overflow,false,JSON.stringify(metrics));assert.equal(metrics.local,false,JSON.stringify(metrics));assert.ok(metrics.width<=440)
   await page.screenshot({path:output+'/'+name+'-'+width+'.png'})
  }
  assert.equal(await page.locator('.bottom-nav>a').count(),4)
  const pair=await page.locator('.service-pair>a').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().top))
  assert.equal(pair[0],pair[1]);await layout('home')
  await page.getByRole('link',{name:/水电燃气.*查用量/}).click();await page.locator('.energy-card').first().waitFor()
  assert.ok((await page.locator('.energy-page').innerText()).includes('12.40'))
  await page.locator('.energy-card').first().getByRole('link',{name:'用量明细'}).click();await page.locator('.usage-row').first().waitFor();await layout('usage')
  await back();await page.locator('.energy-page').waitFor()
  await page.locator('.energy-card').first().getByRole('link',{name:'预存充值'}).click();await page.locator('#deposit-amount').waitFor()
  await page.locator('#deposit-amount').fill('1.001');await page.getByRole('button',{name:'下一步'}).click();assert.ok((await page.locator('#deposit-error').innerText()).includes('最多两位'))
  await page.locator('#deposit-amount').fill('100.10');await page.getByRole('button',{name:'下一步'}).click();await page.getByRole('button',{name:'暂未开通在线支付'}).waitFor()
  assert.equal(await page.getByRole('button',{name:'暂未开通在线支付'}).isDisabled(),true);assert.ok((await page.locator('.confirmation-card').innerText()).includes('居民生活用水'))
  assert.equal(await page.evaluate(()=>window.__calls.filter(c=>c.path.includes('/prepay/deposit/quote')).at(-1).body.amount),'100.10');await layout('deposit-confirm')
  await back();await page.locator('#deposit-amount').waitFor();await back();await page.locator('.energy-page').waitFor();await back();await page.locator('.home-page').waitFor()
  await page.getByRole('link',{name:/物业费预存.*按月预存/}).click();await page.locator('.month-prices>button').first().waitFor();await page.waitForFunction(()=>!document.querySelector('.dock button').disabled)
  await page.getByRole('button',{name:'下一步'}).click();await page.locator('.confirmation-total').waitFor();await back();await page.locator('.prepay-page').waitFor();await back();await page.locator('.home-page').waitFor()
  await page.getByRole('link',{name:'全部账单'}).click();await page.getByRole('button').filter({hasText:'燃气费'}).click();await page.getByRole('link',{name:'查看账单详情'}).click();await page.locator('.detail-list').waitFor()
  const detail=await page.locator('.detail-list').innerText();for(const date of ['2026-10-01','2026-10-31','2026-11-01','2026-11-18','2026-11-30'])assert.ok(detail.includes(date));assert.ok(detail.includes('18.60'));await layout('bill')
  await back();await page.locator('.bills-page').waitFor();await back();await page.locator('.home-page').waitFor()
  await page.locator('.bottom-nav>a').nth(2).click();await page.locator('.account-row').first().waitFor();assert.equal(await page.locator('.account-row').count(),2);await layout('wallet')
  await page.evaluate(()=>window.__selectRoom('empty'));await page.waitForFunction(()=>!document.querySelector('.account-row'))
  assert.ok((await page.locator('.wallet-account').innerText()).includes('0.00'));assert.ok(!(await page.locator('.wallet-page').innerText()).includes('162.80'))
  await page.evaluate(()=>window.__selectRoom('room'));await page.locator('.account-row').first().waitFor()
  await page.evaluate(()=>{window.__energyFail=true;return window.__router.push('/applications/charging-app/energy')});await page.getByText('能源用量暂时无法获取',{exact:true}).waitFor();assert.equal(await page.locator('.energy-card').count(),0)
  await page.evaluate(()=>window.__energyFail=false);await page.getByRole('button',{name:'重新加载'}).click();await page.locator('.energy-card').first().waitFor()
  await page.evaluate(()=>window.__selectRoom('empty'));await page.waitForFunction(()=>document.querySelector('.energy-page')?.textContent.includes('暂未关联能源仪表'));assert.equal(await page.getByRole('link',{name:'预存充值',exact:true}).count(),0)
  assert.deepEqual(errors,[]);await page.close();console.log(width+'px: real shell, layout, usage, deposit validation, billing dates, monthly prepay, room isolation, error retry and back chain passed')
 }
 // A fresh deep link has no module history. Back replaces with parent, then cannot escape the module.
 const deep=await browser.newPage({viewport:{width:390,height:844}})
 await deep.goto(origin+'__owner-check#/applications/charging-app/energy/usage?type=water');await deep.locator('.usage-row').first().waitFor()
 for(const expected of ['/energy','']){await deep.getByRole('button',{name:'返回',exact:true}).click();await deep.waitForFunction(path=>window.__router.currentRoute.value.path==='/applications/charging-app'+path,expected)}
 await deep.getByRole('button',{name:'返回',exact:true}).click();assert.ok(deep.url().includes('/applications/charging-app'));await deep.close()
 console.log('deep link: parent fallback remained inside the application')
}finally{await browser?.close();await server.close()}
